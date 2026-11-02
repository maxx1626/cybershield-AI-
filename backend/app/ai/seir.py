import numpy as np
from scipy.integrate import solve_ivp
from typing import Dict, Any, List, Tuple
import networkx as nx

class SEIRModel:
    """
    Scientific Cyber-Epidemic SEIR (Susceptible-Exposed-Infected-Recovered) Differential Equation Solver.
    
    Equations:
      dS/dt = - beta * (S * I) / N
      dE/dt = beta * (S * I) / N - sigma * E
      dI/dt = sigma * E - gamma * I - mu * I
      dR/dt = gamma * I + mu * I
      
    Where:
      beta: Effective transmission / propagation rate over network graph
      sigma: Latency rate (time to exploit / activate malicious payload)
      gamma: Natural cyber hygiene / automated patching rate
      mu: Active isolation / quarantine rate
      R0 = beta / (gamma + mu) (Basic Reproduction Number)
    """

    def __init__(self, beta_base: float = 0.45, sigma: float = 0.25, gamma: float = 0.08, mu: float = 0.12):
        self.beta_base = beta_base
        self.sigma = sigma
        self.gamma = gamma
        self.mu = mu

    def calculate_parameters_from_network(
        self,
        G: nx.Graph,
        isolated_nodes: int = 0,
        blocked_edges: int = 0,
        active_firewall: bool = True
    ) -> Tuple[float, float, float, float, float]:
        """
        Dynamically derives epidemiological parameters from the structural properties
        of the computer network graph and defense posture.
        """
        total_nodes = max(G.number_of_nodes(), 1)
        total_edges = max(G.number_of_edges(), 1)

        # Average degree: <k> = 2 * E / N
        avg_degree = (2.0 * total_edges) / total_nodes
        clustering_coeff = nx.average_clustering(G) if total_nodes > 2 else 0.1

        # Effective transmission rate beta is directly proportional to network degree and clustering
        # Reduced by blocked edges and active firewall
        firewall_damping = 0.70 if active_firewall else 1.0
        edge_survival_ratio = max(0.2, (total_edges - blocked_edges) / float(total_edges))

        beta = self.beta_base * (avg_degree / 4.0) * (1.0 + clustering_coeff) * firewall_damping * edge_survival_ratio
        beta = float(np.clip(beta, 0.05, 1.2))

        # Sigma is payload activation speed (higher if devices are unpatched)
        sigma = float(self.sigma)

        # Gamma is passive recovery / patch rate
        gamma = float(self.gamma)

        # Mu is active isolation rate; increases as more high-risk nodes are quarantined
        isolation_factor = (isolated_nodes / float(total_nodes)) * 0.4
        mu = float(np.clip(self.mu + isolation_factor, 0.05, 0.8))

        # Basic reproduction number R0
        r0 = float(beta / (gamma + mu))

        return beta, sigma, gamma, mu, r0

    def solve_trajectory(
        self,
        S0: int,
        E0: int,
        I0: int,
        R0_pop: int,
        beta: float,
        sigma: float,
        gamma: float,
        mu: float,
        time_steps: int = 30
    ) -> List[Dict[str, Any]]:
        """
        Numerically integrates the SEIR ODE system using SciPy's solve_ivp (RK45)
        and formats the timeline for visualization.
        """
        N = float(S0 + E0 + I0 + R0_pop)
        if N <= 0:
            N = 60.0

        def seir_ode(t, y):
            S, E, I, R = y
            dS = -beta * (S * I) / N
            dE = beta * (S * I) / N - sigma * E
            dI = sigma * E - (gamma + mu) * I
            dR = (gamma + mu) * I
            return [dS, dE, dI, dR]

        t_span = (0.0, float(time_steps))
        t_eval = np.linspace(0.0, float(time_steps), time_steps + 1)
        y0 = [float(S0), float(E0), float(I0), float(R0_pop)]

        sol = solve_ivp(seir_ode, t_span, y0, t_eval=t_eval, method="RK45")

        trajectory = []
        r0_val = beta / (gamma + mu)

        for idx, t in enumerate(sol.t):
            s_val = max(0.0, float(sol.y[0][idx]))
            e_val = max(0.0, float(sol.y[1][idx]))
            i_val = max(0.0, float(sol.y[2][idx]))
            r_val = max(0.0, float(sol.y[3][idx]))

            # Dynamic effective reproduction rate Rt over time
            rt_val = float(r0_val * (s_val / N))

            trajectory.append({
                "tick": int(round(t)),
                "time_label": f"T+{int(round(t))}s",
                "susceptible": round(s_val, 2),
                "exposed": round(e_val, 2),
                "infected": round(i_val, 2),
                "recovered": round(r_val, 2),
                "reproduction_number_r0": round(rt_val, 3)
            })

        return trajectory

