package com.netsferatu.sinistarapps;

import org.apache.cordova.*;

import com.netsferatu.sinisterapps.R;

import android.app.Activity;
import android.os.Bundle;;

public class fobulous extends DroidGap
{
    @Override
    public void onCreate(Bundle savedInstanceState)
    {
        super.onCreate(savedInstanceState);
        super.setIntegerProperty("splashscreen", R.xml.splash);
        super.loadUrl("file:///android_asset/www/fobulous_droid.html");
    }
}

