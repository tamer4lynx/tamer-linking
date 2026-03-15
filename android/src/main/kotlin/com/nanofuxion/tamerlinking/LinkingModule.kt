package com.nanofuxion.tamerlinking

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.util.Log
import com.lynx.jsbridge.LynxMethod
import com.lynx.jsbridge.LynxModule
import com.lynx.react.bridge.Callback
import com.lynx.react.bridge.JavaOnlyArray
import com.lynx.react.bridge.JavaOnlyMap
import com.lynx.tasm.behavior.LynxContext
import org.json.JSONObject

class LinkingModule(context: Context) : LynxModule(context) {

    companion object {
        private const val TAG = "LinkingModule"
        private const val URL_EVENT = "tamer-linking:url"

        @Volatile
        var instance: LinkingModule? = null
            private set

        @Volatile
        var pendingInitialUrl: String? = null

        fun setInitialUrl(url: String?) {
            pendingInitialUrl = url
        }

        fun onUrlReceived(url: String?) {
            if (url.isNullOrBlank()) return
            instance?.emitUrl(url)
        }
    }

    init {
        instance = this
    }

    @LynxMethod
    fun createURL(path: String, optionsJson: String): String {
        return try {
            val opts = JSONObject(optionsJson)
            val scheme = opts.optString("scheme", "tamerdevapp")
            val p = opts.optString("path", path).trimStart('/')
            val queryParams = opts.optJSONObject("queryParams")
            val base = "$scheme://$p"
            if (queryParams != null && queryParams.length() > 0) {
                val pairs = mutableListOf<String>()
                queryParams.keys().forEach { key ->
                    pairs.add("${Uri.encode(key)}=${Uri.encode(queryParams.getString(key))}")
                }
                "$base?${pairs.joinToString("&")}"
            } else {
                base
            }
        } catch (e: Exception) {
            Log.e(TAG, "createURL error: ${e.message}")
            "tamerdevapp://${path.trimStart('/')}"
        }
    }

    @LynxMethod
    fun getInitialURL(callback: Callback) {
        val url = pendingInitialUrl
        if (url != null) {
            pendingInitialUrl = null
        }
        callback.invoke(url ?: "")
    }

    private fun emitUrl(url: String) {
        val lynxContext = mContext as? LynxContext ?: return
        val eventDetails = JavaOnlyMap()
        eventDetails.putString("payload", JSONObject().put("url", url).toString())
        val params = JavaOnlyArray()
        params.pushMap(eventDetails)
        lynxContext.sendGlobalEvent(URL_EVENT, params)
    }
}
