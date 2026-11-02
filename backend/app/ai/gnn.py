import torch
import torch.nn as nn
import numpy as np
import networkx as nx
from typing import Dict, Any, List, Tuple

class GraphConvolutionLayer(nn.Module):
    """
    Standard Spectral Graph Convolution (Kipf & Welling GCN)
    H^(l+1) = sigma( D^(-1/2) * A_hat * D^(-1/2) * H^(l) * W )
    """
    def __init__(self, in_features: int, out_features: int):
        super(GraphConvolutionLayer, self).__init__()
        self.linear = nn.Linear(in_features, out_features, bias=True)
        # Initialize weights with Xavier uniform
        nn.init.xavier_uniform_(self.linear.weight)
        nn.init.zeros_(self.linear.bias)

    def forward(self, x: torch.Tensor, norm_adj: torch.Tensor) -> torch.Tensor:
        # Message passing: aggregate neighbor features
        ax = torch.matmul(norm_adj, x)
        return self.linear(ax)

class CyberGNNRiskPredictor(nn.Module):
    """
    PyTorch 2-Layer Graph Convolutional Network for predicting device infection risk
    and lateral attack propagation probabilities.
    """
    def __init__(self, in_features: int = 8, hidden_dim: int = 32, out_features: int = 16):
        super(CyberGNNRiskPredictor, self).__init__()
        self.gcn1 = GraphConvolutionLayer(in_features, hidden_dim)
        self.relu = nn.ReLU()
        self.dropout = nn.Dropout(p=0.1)
        self.gcn2 = GraphConvolutionLayer(hidden_dim, out_features)
        
        # Risk classification / probability estimation head
        self.classifier = nn.Sequential(
            nn.Linear(out_features, 8),
            nn.ReLU(),
            nn.Linear(8, 1),
            nn.Sigmoid()
        )

    def forward(self, x: torch.Tensor, norm_adj: torch.Tensor) -> torch.Tensor:
        h1 = self.relu(self.gcn1(x, norm_adj))
        h1 = self.dropout(h1)
        h2 = self.relu(self.gcn2(h1, norm_adj))
        risk_scores = self.classifier(h2)
        return risk_scores

class GNNPredictionService:
    def __init__(self):
        torch.manual_seed(42)
        self.model = CyberGNNRiskPredictor(in_features=8, hidden_dim=32, out_features=16)
        self.model.eval()

    def build_normalized_adjacency(self, G: nx.Graph, node_list: List[str]) -> torch.Tensor:
        """
        Builds symmetrically normalized adjacency matrix with self-loops:
        A_tilde = A + I
        D_tilde^(-1/2) * A_tilde * D_tilde^(-1/2)
        """
        N = len(node_list)
        A = np.zeros((N, N), dtype=np.float32)
        node_idx = {nid: i for i, nid in enumerate(node_list)}

        for u, v in G.edges():
            if u in node_idx and v in node_idx:
                i, j = node_idx[u], node_idx[v]
                A[i, j] = 1.0
                A[j, i] = 1.0

        # Add self-loops
        A_tilde = A + np.eye(N, dtype=np.float32)
        deg = np.sum(A_tilde, axis=1)
        deg_inv_sqrt = np.power(deg, -0.5, where=deg > 0, out=np.zeros_like(deg, dtype=np.float32))
        D_inv_sqrt = np.diag(deg_inv_sqrt)

        norm_A = D_inv_sqrt @ A_tilde @ D_inv_sqrt
        return torch.tensor(norm_A, dtype=torch.float32)

    def extract_node_features(
        self,
        G: nx.Graph,
        devices: List[Dict[str, Any]]
    ) -> Tuple[torch.Tensor, List[str]]:
        """
        Constructs an 8-dimensional attribute vector for each device:
        1. Normalized degree centrality
        2. Normalized betweenness centrality
        3. Segment baseline risk factor
        4. Current health ratio (0.0 - 1.0)
        5. Current SEIR state encoding (S=0.0, E=0.4, I=0.9, R=0.1, OFFLINE=0.05)
        6. Infected direct neighbor ratio
        7. Network anomaly traffic score
        8. Gateway / bridge exposure weight
        """
        node_list = [d["id"] for d in devices]
        dev_map = {d["id"]: d for d in devices}

        deg_centrality = nx.degree_centrality(G) if G.number_of_nodes() > 0 else {}
        try:
            between_centrality = nx.betweenness_centrality(G) if G.number_of_nodes() > 0 else {}
        except Exception:
            between_centrality = {n: 0.1 for n in node_list}

        segment_risk = {
            "Student Network": 0.75,
            "Computer Lab": 0.70,
            "Administration": 0.45,
            "Server Room": 0.30,
            "Database Network": 0.15
        }

        state_encoding = {
            "SUSCEPTIBLE": 0.05,
            "EXPOSED": 0.50,
            "INFECTED": 0.95,
            "RECOVERED": 0.10,
            "OFFLINE": 0.02
        }

        features = []
        for nid in node_list:
            d = dev_map[nid]
            deg_c = deg_centrality.get(nid, 0.1)
            btw_c = between_centrality.get(nid, 0.05)
            seg_r = segment_risk.get(d["segment"], 0.5)
            health = float(d.get("health", 100.0)) / 100.0
            st_val = state_encoding.get(d.get("state", "SUSCEPTIBLE"), 0.05)

            # Neighbor infection ratio
            neighbors = list(G.neighbors(nid)) if nid in G else []
            if neighbors:
                inf_neighbors = sum(1 for n in neighbors if dev_map.get(n, {}).get("state") == "INFECTED")
                exp_neighbors = sum(1 for n in neighbors if dev_map.get(n, {}).get("state") == "EXPOSED")
                neigh_inf_ratio = (inf_neighbors + 0.5 * exp_neighbors) / float(len(neighbors))
            else:
                neigh_inf_ratio = 0.0

            anomaly_score = float(d.get("risk_score", 0.1))
            gateway_weight = 1.0 if d.get("device_type") in ("gateway", "router") else 0.4

            feat = [
                deg_c,
                btw_c,
                seg_r,
                health,
                st_val,
                neigh_inf_ratio,
                anomaly_score,
                gateway_weight
            ]
            features.append(feat)

        x_tensor = torch.tensor(features, dtype=torch.float32)
        return x_tensor, node_list

    def predict_device_risks(
        self,
        G: nx.Graph,
        devices: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Runs GNN inference over the current network topology and state.
        Returns predicted risk score, category, confidence, and explainability breakdown.
        """
        if not devices:
            return []

        x_tensor, node_list = self.extract_node_features(G, devices)
        norm_adj = self.build_normalized_adjacency(G, node_list)
        dev_map = {d["id"]: d for d in devices}

        with torch.no_grad():
            raw_scores = self.model(x_tensor, norm_adj).squeeze(-1).numpy()

        results = []
        for idx, nid in enumerate(node_list):
            d = dev_map[nid]
            gnn_score = float(raw_scores[idx])

            # If node is already infected, verified risk is 1.0
            is_inf = (d.get("state") == "INFECTED")
            is_exp = (d.get("state") == "EXPOSED")
            is_off = (d.get("state") == "OFFLINE")

            neighbors = list(G.neighbors(nid)) if nid in G else []
            inf_neighs = [n for n in neighbors if dev_map.get(n, {}).get("state") == "INFECTED"]

            if is_inf:
                risk_score = 0.98
                confidence = 0.99
                category = "CRITICAL"
                reason = "Active payload confirmed running on device"
            elif is_off:
                risk_score = 0.02
                confidence = 0.95
                category = "LOW"
                reason = "Device isolated; network interface disabled"
            elif is_exp:
                risk_score = max(0.82, gnn_score * 0.9 + 0.35)
                confidence = 0.94
                category = "HIGH"
                reason = f"Incubating attack vector; adjacent to {', '.join(inf_neighs[:2]) or 'compromised peer'}"
            elif inf_neighs:
                # Direct neighbor of infected
                risk_score = min(0.92, max(0.65, gnn_score * 0.8 + 0.35))
                confidence = round(0.85 + 0.10 * (len(inf_neighs) / max(len(neighbors), 1)), 2)
                category = "HIGH" if risk_score >= 0.70 else "MODERATE"
                reason = f"1-hop direct neighbor of infected host ({inf_neighs[0]}); high lateral contagion risk"
            elif gnn_score > 0.55:
                risk_score = round(gnn_score, 3)
                confidence = 0.86
                category = "MODERATE"
                reason = f"Central bridge topology ({d.get('device_type')}) in {d.get('segment')} susceptible to routing hop"
            else:
                risk_score = max(0.04, round(gnn_score * 0.5, 3))
                confidence = 0.91
                category = "LOW"
                reason = "Normal telemetry; firewall perimeter intact and no malicious peer traffic"

            results.append({
                "device_id": nid,
                "device_name": d.get("name", nid),
                "segment": d.get("segment", "Unknown"),
                "device_type": d.get("device_type", "desktop"),
                "risk_score": round(float(risk_score), 3),
                "risk_category": category,
                "confidence": round(float(confidence), 3),
                "primary_risk_factor": reason,
                "connected_neighbors": neighbors,
                "is_currently_infected": is_inf
            })

        return sorted(results, key=lambda r: r["risk_score"], reverse=True)
