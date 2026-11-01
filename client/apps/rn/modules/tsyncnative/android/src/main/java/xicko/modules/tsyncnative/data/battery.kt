package xicko.modules.tsyncnative.data

import kotlinx.serialization.Serializable

@Serializable
data class BatteryStatus(
  val level: Int,
  val isPlugged: Boolean,
  val timestamp: Long,
)