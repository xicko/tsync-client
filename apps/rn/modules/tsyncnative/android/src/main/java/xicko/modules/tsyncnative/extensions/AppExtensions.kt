package xicko.modules.tsyncnative.extensions

import android.app.Application
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.util.Log
import com.topjohnwu.superuser.Shell
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import xicko.modules.tsyncnative.data.AppInfo

fun Context.retrieveApps(): String {
  val appList = mutableListOf<AppInfo>()
  try {
    val flags = PackageManager.GET_META_DATA
    val installedApps = packageManager.getInstalledApplications(flags)

    for (appInfo in installedApps) {
      appList.add(
        AppInfo(
          appInfo.loadLabel(packageManager).toString(),
          appInfo.packageName,
        )
      )
    }

    return Json.encodeToString(appList)
  } catch (e: Exception) {
    e.message?.let { Log.d("retrieveApps error:", it) }
    return ""
  }
}

fun getHostPackageNameLegacy(): String {
  return runCatching {
    val activityThreadClass = Class.forName("android.app.ActivityThread")
    val currentPackageName = activityThreadClass.getMethod("currentPackageName").invoke(null) as? String

    currentPackageName?.takeIf { it.isNotEmpty() } ?: run {
      val currentApp = activityThreadClass.getMethod("currentApplication").invoke(null) as? android.app.Application
      currentApp?.packageName
    }
  }.getOrNull() ?: ""
}

fun getHostPackageName(): String {
  return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
    Application.getProcessName().substringBefore(':')
  } else {
    getHostPackageNameLegacy()
  }
}

fun Context.openApp() {
  val packageName = getHostPackageName()

  val hasRootAccess = isRooted()
  if (hasRootAccess) {
    val result = Shell.cmd("am start -n $packageName/.MainActivity").exec()
    if (result.isSuccess) return
  }

  val intent = packageManager.getLaunchIntentForPackage(packageName)
  intent?.apply {
    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
    addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP)
    addFlags(Intent.FLAG_ACTIVITY_REORDER_TO_FRONT)
  }
  intent?.let { startActivity(it) }
}
