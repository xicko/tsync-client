package xicko.modules.tsyncnative.extensions

import android.content.Context
import android.content.pm.PackageManager
import android.util.Log
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
