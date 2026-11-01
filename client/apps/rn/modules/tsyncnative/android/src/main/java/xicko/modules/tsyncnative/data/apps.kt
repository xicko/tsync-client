package xicko.modules.tsyncnative.data

import android.annotation.SuppressLint
import kotlinx.serialization.Serializable

@SuppressLint("UnsafeOptInUsageError")
@Serializable
data class AppInfo(
  val name: String,
  val packageName: String,
)
