package xicko.modules.tsyncnative.data

import kotlinx.serialization.Serializable

@Serializable
data class WorkerOptions(
  val showNotifications: Boolean = true
)

@Serializable
data class WorkersConfig(
  val connection: WorkerOptions = WorkerOptions(),
  val battery: WorkerOptions = WorkerOptions()
)

enum class WorkerType(val id: String) {
  CONNECTION("connection"),
  BATTERY("battery")
}
