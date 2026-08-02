package xicko.modules.tsyncnative.receivers

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log
import androidx.core.content.ContextCompat

class AlarmReceiver: BroadcastReceiver() {
    override fun onReceive(ctx: Context?, p1: Intent?) {
        Log.i("AlarmReceiver", "onReceive")
    }
}