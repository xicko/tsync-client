package xicko.modules.tsyncnative.receivers

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import xicko.modules.tsyncnative.BatteryWorker
import xicko.modules.tsyncnative.ConnectionWorker
import xicko.modules.tsyncnative.helpers.connectTSRoot
import xicko.modules.tsyncnative.helpers.disableOptimizationsRoot
import java.util.concurrent.TimeUnit

class BootCompletedReceiver: BroadcastReceiver() {
    override fun onReceive(ctx: Context?, intent: Intent?) {
        if (intent?.action == "android.intent.action.BOOT_COMPLETED") {
            Log.i("BootCompletedReceiver", "BootCompletedReceiver")

            ctx?.let {
                val workManager = WorkManager.getInstance(it)

                disableOptimizationsRoot(it, null)
                disableOptimizationsRoot(it, "com.tailscale.ipn")

                connectTSRoot()

                // ==================================================================
                // Connection Worker
                val connectionOneTimeReq = OneTimeWorkRequestBuilder<ConnectionWorker>().build()
                workManager.enqueue(connectionOneTimeReq)
                val connectionPeriodicReq = PeriodicWorkRequestBuilder<ConnectionWorker>(15, TimeUnit.MINUTES).build()
                workManager.enqueueUniquePeriodicWork("connection_worker_boot",
                    ExistingPeriodicWorkPolicy.UPDATE,
                    connectionPeriodicReq
                )

                // ==================================================================
                // Connection Worker
                val batteryOneTimeReq = OneTimeWorkRequestBuilder<BatteryWorker>().build()
                workManager.enqueue(batteryOneTimeReq)
                val batteryPeriodicReq = PeriodicWorkRequestBuilder<BatteryWorker>(15, TimeUnit.MINUTES).build()
                workManager.enqueueUniquePeriodicWork("battery_worker_boot",
                    ExistingPeriodicWorkPolicy.UPDATE,
                    batteryPeriodicReq
                )
            }
        }
    }
}