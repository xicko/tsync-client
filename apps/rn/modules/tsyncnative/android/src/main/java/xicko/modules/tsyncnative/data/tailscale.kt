package xicko.modules.tsyncnative.data

import kotlinx.serialization.Serializable

@Serializable
data class TailscaleClientConnectivity(
    val endpoints: List<String>? = null,
    val mappingVariesByDestIP: Boolean? = null,
    val latency: Map<String, TailscaleLatency>? = null,
    val clientSupports: TailscaleClientSupports? = null
)

@Serializable
data class TailscaleLatency(
    val preferred: Boolean? = null,
    val latencyMs: Double? = null
)

@Serializable
data class TailscaleClientSupports(
    val hairPinning: Boolean? = null,
    val ipv6: Boolean? = null,
    val pcp: Boolean? = null,
    val pmp: Boolean? = null,
    val udp: Boolean? = null,
    val upnp: Boolean? = null
)

@Serializable
data class TailscalePostureIdentity(
    val serialNumbers: List<String>? = null,
    val disabled: Boolean? = null
)

@Serializable
data class TailscaleDistro(
    val name: String? = null,
    val version: String? = null,
    val codeName: String? = null
)

@Serializable
data class TailscaleDevice(
    val addresses: List<String>,
    val id: String,
    val nodeId: String,
    val user: String,
    val name: String,
    val hostname: String,
    val clientVersion: String,
    val updateAvailable: Boolean,
    val os: String,
    val created: String,
    val connectedToControl: Boolean,
    val lastSeen: String? = null,
    val keyExpiryDisabled: Boolean,
    val expires: String,
    val authorized: Boolean,
    val isExternal: Boolean,
    val multipleConnections: Boolean? = null,
    val machineKey: String,
    val nodeKey: String,
    val blocksIncomingConnections: Boolean,
    val enabledRoutes: List<String> = emptyList(),
    val advertisedRoutes: List<String> = emptyList(),
    val clientConnectivity: TailscaleClientConnectivity? = null,
    val tags: List<String> = emptyList(),
    val tailnetLockError: String,
    val tailnetLockKey: String,
    val sshEnabled: Boolean? = null,
    val postureIdentity: TailscalePostureIdentity? = null,
    val isEphemeral: Boolean? = null,
    val distro: TailscaleDistro? = null,
    val isHost: Boolean? = null,
    val isThisDevice: Boolean? = null,
    val battery: BatteryStatus? = null,
    val androidConfig: TailscaleAndroidConfig? = null,
    val windowsConfig: TailscaleWindowsConfig? = null
)

@Serializable
data class TailscaleAndroidConfig(
    val adb: TailscaleAdbConfig? = null
)

@Serializable
data class TailscaleAdbConfig(
    val port: Int? = null
)

@Serializable
data class TailscaleWindowsConfig(
    val macAddress: String? = null
)
