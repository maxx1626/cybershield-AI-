import math
from typing import List, Dict, Any, Tuple
import networkx as nx

SEGMENT_METADATA = {
    "Administration": {
        "color": "#38BDF8",  # Sky blue
        "center": (-30.0, 10.0, -15.0),
        "radius": 14.0,
        "subnet": "10.0.10",
        "description": "Executive, HR, and Financial Department Systems"
    },
    "Computer Lab": {
        "color": "#22C55E",  # Emerald green
        "center": (-25.0, -15.0, 20.0),
        "radius": 18.0,
        "subnet": "10.0.20",
        "description": "Educational Computer Lab Workstations"
    },
    "Student Network": {
        "color": "#A855F7",  # Purple
        "center": (25.0, -18.0, 20.0),
        "radius": 18.0,
        "subnet": "10.0.30",
        "description": "BYOD Wireless Student Laptops and Access Points"
    },
    "Server Room": {
        "color": "#3B82F6",  # Electric blue
        "center": (0.0, 22.0, 0.0),
        "radius": 15.0,
        "subnet": "10.0.40",
        "description": "Core Infrastructure, AD Domain Controller & Web Services"
    },
    "Database Network": {
        "color": "#F59E0B",  # Amber
        "center": (30.0, 10.0, -15.0),
        "radius": 14.0,
        "subnet": "10.0.50",
        "description": "High-Security Master DB, Replicas, and Redis Caches"
    }
}

def generate_network_topology() -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]], nx.Graph]:
    devices = []
    connections = []
    G = nx.Graph()

    # 1. Administration (8 devices)
    admin_defs = [
        ("DEV-ADM-GW01", "Admin Gateway Router", "gateway", "10.0.10.1", "00:50:56:A1:00:01", 0.0, 0.0, 0.0),
        ("DEV-ADM-SW01", "Admin Edge Switch", "router", "10.0.10.2", "00:50:56:A1:00:02", 0.3, 0.2, 0.0),
        ("DEV-ADM-DC01", "Admin Domain Controller", "server", "10.0.10.10", "00:50:56:A1:00:10", 0.5, 0.8, 0.3),
        ("DEV-ADM-EXEC01", "CEO Executive PC", "desktop", "10.0.10.21", "00:50:56:A1:00:21", 0.8, -0.4, 0.5),
        ("DEV-ADM-FIN01", "Finance Lead Workstation", "desktop", "10.0.10.22", "00:50:56:A1:00:22", -0.7, 0.5, 0.4),
        ("DEV-ADM-FIN02", "Payroll Analyst Workstation", "desktop", "10.0.10.23", "00:50:56:A1:00:23", -0.6, -0.6, 0.5),
        ("DEV-ADM-HR01", "HR Director Workstation", "laptop", "10.0.10.31", "00:50:56:A1:00:31", 0.4, -0.8, -0.4),
        ("DEV-ADM-HR02", "Talent Acquisition Workstation", "laptop", "10.0.10.32", "00:50:56:A1:00:32", -0.3, 0.7, -0.5),
    ]

    # 2. Computer Lab (18 devices)
    lab_defs = [
        ("DEV-LAB-GW01", "Computer Lab Gateway", "gateway", "10.0.20.1", "00:50:56:B2:00:01", 0.0, 0.0, 0.0),
        ("DEV-LAB-SW01", "Lab Core Switch", "router", "10.0.20.2", "00:50:56:B2:00:02", 0.2, 0.1, 0.1),
    ]
    for i in range(1, 17):
        angle = (i / 16.0) * 2 * math.pi
        rad = 0.5 + 0.4 * (i % 3) / 3.0
        lab_defs.append((
            f"DEV-LAB-PC{i:02d}",
            f"Lab Workstation #{i:02d}",
            "desktop",
            f"10.0.20.{10+i}",
            f"00:50:56:B2:00:{10+i:02X}",
            math.cos(angle) * rad,
            math.sin(angle) * rad,
            (0.3 if i % 2 == 0 else -0.3)
        ))

    # 3. Student Network (16 devices)
    student_defs = [
        ("DEV-STU-GW01", "Student Wireless Gateway", "gateway", "10.0.30.1", "00:50:56:C3:00:01", 0.0, 0.0, 0.0),
        ("DEV-STU-AP01", "North Hall Access Point", "router", "10.0.30.2", "00:50:56:C3:00:02", 0.4, 0.3, 0.2),
        ("DEV-STU-AP02", "South Hall Access Point", "router", "10.0.30.3", "00:50:56:C3:00:03", -0.4, -0.3, -0.2),
    ]
    for i in range(1, 14):
        angle = (i / 13.0) * 2 * math.pi
        rad = 0.6 + 0.35 * (i % 2)
        student_defs.append((
            f"DEV-STU-NB{i:02d}",
            f"Student Laptop #{i:02d}",
            "laptop",
            f"10.0.30.{10+i}",
            f"00:50:56:C3:00:{10+i:02X}",
            math.cos(angle) * rad,
            math.sin(angle) * rad,
            0.4 * math.sin(angle * 2)
        ))

    # 4. Server Room (10 devices)
    server_defs = [
        ("DEV-SRV-EDGW", "Border Firewall / Gateway", "gateway", "10.0.40.1", "00:50:56:D4:00:01", 0.0, 0.2, 0.0),
        ("DEV-SRV-CORE", "Backbone Core Switch", "router", "10.0.40.2", "00:50:56:D4:00:02", 0.0, -0.2, 0.0),
        ("DEV-SRV-AD01", "Primary Active Directory Server", "server", "10.0.40.10", "00:50:56:D4:00:10", -0.6, 0.6, 0.3),
        ("DEV-SRV-APP01", "Production Web Application 01", "server", "10.0.40.11", "00:50:56:D4:00:11", 0.7, 0.5, 0.4),
        ("DEV-SRV-APP02", "Production Web Application 02", "server", "10.0.40.12", "00:50:56:D4:00:12", 0.8, -0.4, -0.3),
        ("DEV-SRV-MAIL", "Secure Exchange Mail Server", "server", "10.0.40.15", "00:50:56:D4:00:15", -0.7, -0.5, -0.4),
        ("DEV-SRV-DNS", "Internal DNS & DHCP Server", "server", "10.0.40.20", "00:50:56:D4:00:20", -0.4, 0.8, -0.3),
        ("DEV-SRV-PROXY", "Reverse Proxy / WAF", "server", "10.0.40.25", "00:50:56:D4:00:25", 0.5, -0.7, 0.3),
        ("DEV-SRV-IDS", "AI Intrusion Detection Sensor", "server", "10.0.40.30", "00:50:56:D4:00:30", -0.2, -0.8, 0.5),
        ("DEV-SRV-BAK", "Automated Disaster Recovery Backup", "server", "10.0.40.40", "00:50:56:D4:00:40", 0.2, 0.8, -0.5),
    ]

    # 5. Database Network (8 devices)
    db_defs = [
        ("DEV-DB-GW01", "Database Security Gateway", "gateway", "10.0.50.1", "00:50:56:E5:00:01", 0.0, 0.0, 0.0),
        ("DEV-DB-SW01", "DB Isolator Switch", "router", "10.0.50.2", "00:50:56:E5:00:02", 0.2, 0.2, 0.1),
        ("DEV-DB-PG01", "Primary PostgreSQL Cluster", "database_server", "10.0.50.10", "00:50:56:E5:00:10", -0.6, 0.6, 0.4),
        ("DEV-DB-PG02", "Hot-Standby Read Replica", "database_server", "10.0.50.11", "00:50:56:E5:00:11", -0.7, -0.4, 0.5),
        ("DEV-DB-RED01", "In-Memory Redis Cache 01", "database_server", "10.0.50.20", "00:50:56:E5:00:20", 0.7, 0.5, -0.3),
        ("DEV-DB-RED02", "In-Memory Redis Cache 02", "database_server", "10.0.50.21", "00:50:56:E5:00:21", 0.6, -0.6, -0.4),
        ("DEV-DB-ANALYT", "Real-Time Telemetry Analytics DB", "database_server", "10.0.50.30", "00:50:56:E5:00:30", -0.3, -0.8, -0.2),
        ("DEV-DB-VAULT", "Hardware Security Module / Secret Vault", "database_server", "10.0.50.99", "00:50:56:E5:00:99", 0.2, 0.7, 0.6),
    ]

    segment_defs = [
        ("Administration", admin_defs),
        ("Computer Lab", lab_defs),
        ("Student Network", student_defs),
        ("Server Room", server_defs),
        ("Database Network", db_defs),
    ]

    for seg_name, defs in segment_defs:
        meta = SEGMENT_METADATA[seg_name]
        cx, cy, cz = meta["center"]
        r = meta["radius"]

        for d_id, name, dtype, ip, mac, ox, oy, oz in defs:
            px = cx + ox * r
            py = cy + oy * r
            pz = cz + oz * r

            dev = {
                "id": d_id,
                "name": name,
                "device_type": dtype,
                "ip_address": ip,
                "mac_address": mac,
                "segment": seg_name,
                "state": "SUSCEPTIBLE",
                "risk_score": 0.05,
                "health": 100.0,
                "last_activity": "2026-11-03T00:00:00Z",
                "pos_x": round(px, 2),
                "pos_y": round(py, 2),
                "pos_z": round(pz, 2),
            }
            devices.append(dev)
            G.add_node(d_id, **dev)

    # Add intra-segment links
    # 1. Admin: Switch connects to Gateway and all Admin PCs
    for d in admin_defs:
        if d[0] != "DEV-ADM-SW01":
            connections.append({"source_id": "DEV-ADM-SW01", "target_id": d[0], "connection_type": "LAN", "bandwidth_mbps": 1000, "is_blocked": False})
            G.add_edge("DEV-ADM-SW01", d[0], weight=1.0)
    # Admin DC connected to Exec
    connections.append({"source_id": "DEV-ADM-DC01", "target_id": "DEV-ADM-EXEC01", "connection_type": "LAN", "bandwidth_mbps": 1000, "is_blocked": False})
    G.add_edge("DEV-ADM-DC01", "DEV-ADM-EXEC01", weight=1.0)

    # 2. Computer Lab: Lab switch connects to Lab Gateway and all PCs
    for d in lab_defs:
        if d[0] not in ("DEV-LAB-GW01", "DEV-LAB-SW01"):
            connections.append({"source_id": "DEV-LAB-SW01", "target_id": d[0], "connection_type": "LAN", "bandwidth_mbps": 1000, "is_blocked": False})
            G.add_edge("DEV-LAB-SW01", d[0], weight=1.0)
    connections.append({"source_id": "DEV-LAB-GW01", "target_id": "DEV-LAB-SW01", "connection_type": "LAN", "bandwidth_mbps": 10000, "is_blocked": False})
    G.add_edge("DEV-LAB-GW01", "DEV-LAB-SW01", weight=1.0)
    # Inter-PC peer connections in lab (file sharing / local gaming / peer-to-peer)
    for i in range(1, 16):
        connections.append({"source_id": f"DEV-LAB-PC{i:02d}", "target_id": f"DEV-LAB-PC{i+1:02d}", "connection_type": "LAN", "bandwidth_mbps": 1000, "is_blocked": False})
        G.add_edge(f"DEV-LAB-PC{i:02d}", f"DEV-LAB-PC{i+1:02d}", weight=0.8)

    # 3. Student Network: AP01 and AP02 connect to Gateway; students connect to APs
    connections.append({"source_id": "DEV-STU-GW01", "target_id": "DEV-STU-AP01", "connection_type": "LAN", "bandwidth_mbps": 10000, "is_blocked": False})
    connections.append({"source_id": "DEV-STU-GW01", "target_id": "DEV-STU-AP02", "connection_type": "LAN", "bandwidth_mbps": 10000, "is_blocked": False})
    G.add_edge("DEV-STU-GW01", "DEV-STU-AP01", weight=1.0)
    G.add_edge("DEV-STU-GW01", "DEV-STU-AP02", weight=1.0)
    for i in range(1, 14):
        target_ap = "DEV-STU-AP01" if i <= 7 else "DEV-STU-AP02"
        connections.append({"source_id": target_ap, "target_id": f"DEV-STU-NB{i:02d}", "connection_type": "LAN", "bandwidth_mbps": 300, "is_blocked": False})
        G.add_edge(target_ap, f"DEV-STU-NB{i:02d}", weight=0.7)

    # 4. Server Room: Backbone Core connected to Edge Gateway and all servers
    connections.append({"source_id": "DEV-SRV-EDGW", "target_id": "DEV-SRV-CORE", "connection_type": "ROUTED", "bandwidth_mbps": 40000, "is_blocked": False})
    G.add_edge("DEV-SRV-EDGW", "DEV-SRV-CORE", weight=1.0)
    for d in server_defs:
        if d[0] not in ("DEV-SRV-EDGW", "DEV-SRV-CORE"):
            connections.append({"source_id": "DEV-SRV-CORE", "target_id": d[0], "connection_type": "LAN", "bandwidth_mbps": 10000, "is_blocked": False})
            G.add_edge("DEV-SRV-CORE", d[0], weight=1.0)
    # Web App to reverse proxy
    connections.append({"source_id": "DEV-SRV-PROXY", "target_id": "DEV-SRV-APP01", "connection_type": "LAN", "bandwidth_mbps": 10000, "is_blocked": False})
    connections.append({"source_id": "DEV-SRV-PROXY", "target_id": "DEV-SRV-APP02", "connection_type": "LAN", "bandwidth_mbps": 10000, "is_blocked": False})
    G.add_edge("DEV-SRV-PROXY", "DEV-SRV-APP01", weight=1.0)
    G.add_edge("DEV-SRV-PROXY", "DEV-SRV-APP02", weight=1.0)

    # 5. Database Network: DB switch connects to DB Gateway and DB servers
    connections.append({"source_id": "DEV-DB-GW01", "target_id": "DEV-DB-SW01", "connection_type": "LAN", "bandwidth_mbps": 20000, "is_blocked": False})
    G.add_edge("DEV-DB-GW01", "DEV-DB-SW01", weight=1.0)
    for d in db_defs:
        if d[0] not in ("DEV-DB-GW01", "DEV-DB-SW01"):
            connections.append({"source_id": "DEV-DB-SW01", "target_id": d[0], "connection_type": "LAN", "bandwidth_mbps": 10000, "is_blocked": False})
            G.add_edge("DEV-DB-SW01", d[0], weight=1.0)
    # PG replication link
    connections.append({"source_id": "DEV-DB-PG01", "target_id": "DEV-DB-PG02", "connection_type": "LAN", "bandwidth_mbps": 10000, "is_blocked": False})
    G.add_edge("DEV-DB-PG01", "DEV-DB-PG02", weight=1.0)

    # --- INTER-SEGMENT BACKBONE ROUTING ---
    # Core Server Edge Gateway connects to all segment gateways
    gateways = ["DEV-ADM-GW01", "DEV-LAB-GW01", "DEV-STU-GW01", "DEV-DB-GW01"]
    for gw in gateways:
        connections.append({"source_id": "DEV-SRV-EDGW", "target_id": gw, "connection_type": "GATEWAY", "bandwidth_mbps": 10000, "is_blocked": False})
        G.add_edge("DEV-SRV-EDGW", gw, weight=1.0)

    # App servers connect to DB Gateway
    connections.append({"source_id": "DEV-SRV-APP01", "target_id": "DEV-DB-GW01", "connection_type": "ROUTED", "bandwidth_mbps": 10000, "is_blocked": False})
    connections.append({"source_id": "DEV-SRV-APP02", "target_id": "DEV-DB-GW01", "connection_type": "ROUTED", "bandwidth_mbps": 10000, "is_blocked": False})
    G.add_edge("DEV-SRV-APP01", "DEV-DB-GW01", weight=0.9)
    G.add_edge("DEV-SRV-APP02", "DEV-DB-GW01", weight=0.9)

    return devices, connections, G

