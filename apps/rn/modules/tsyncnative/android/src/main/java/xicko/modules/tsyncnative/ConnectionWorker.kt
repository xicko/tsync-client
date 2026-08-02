package xicko.modules.tsyncnative

import android.content.Context
import android.os.SystemClock.sleep
import android.util.Log
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.tencent.mmkv.MMKV
import io.ktor.client.HttpClient
import io.ktor.client.engine.cio.CIO
import io.ktor.client.plugins.HttpTimeout
import io.ktor.client.request.get
import io.ktor.client.statement.bodyAsText
import io.ktor.http.HttpStatusCode
import xicko.modules.tsyncnative.helpers.NotificationHelper
import xicko.modules.tsyncnative.helpers.connectTS


class ConnectionWorker(
    context: Context,
    params: WorkerParameters
): CoroutineWorker(context, params) {
    override suspend fun doWork(): Result {
        val client = HttpClient(CIO) {
            install(HttpTimeout) {
                connectTimeoutMillis = 3500L
                requestTimeoutMillis = 3500L
            }
        }

        var isConnected: Boolean = false

        try {
            MMKV.initialize(this.applicationContext)
            val mmkv = MMKV.mmkvWithID("root", MMKV.MULTI_PROCESS_MODE)
            val domain = mmkv.decodeString("domain", null) ?: throw Exception("domain not found")

            val response = client.get("$domain/api/sys/ping")
            isConnected = response.status == HttpStatusCode.OK && response.bodyAsText() == "true"
            NotificationHelper.show(
                this.applicationContext,
                "tsync Connection Service",
                if (isConnected) "Tailscale connected" else "Tailscale disconnected",
                android.R.drawable.ic_dialog_info
            )

            Result.success()
        } catch (e: Exception) {
            isConnected = false
            NotificationHelper.show(
                this.applicationContext,
                "tsync Connection Service",
                "error: ${e.message}",
                android.R.drawable.stat_notify_error
            )

            Result.retry()
        } finally {
            client.close()
        }

        if (!isConnected) {
            connectTS(applicationContext)
            sleep(1500L)
            connectTS(applicationContext)
        }

        Log.i("ConnectionWorker", "doWork $isConnected")

        return Result.success()
    }
}