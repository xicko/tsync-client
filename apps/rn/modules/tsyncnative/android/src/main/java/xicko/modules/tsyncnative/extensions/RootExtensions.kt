package xicko.modules.tsyncnative.extensions

import android.content.Context
import android.util.Log
import com.topjohnwu.superuser.Shell

fun getShell(): Shell {
    return Shell.getCachedShell() ?: Shell.getShell()
}

fun isRooted(): Boolean {
    val shell = getShell()
    Log.i("isRoot shell", "${shell.isRoot}")
    return shell.isRoot && Shell.isAppGrantedRoot() == true
}

val Context.isRooted: Boolean
    get() = xicko.modules.tsyncnative.extensions.isRooted()
