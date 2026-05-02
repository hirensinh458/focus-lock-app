package com.focuslockapp;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.TextView;

public class LockOverlayActivity extends Activity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Keep screen on and show over lock screen
        getWindow().addFlags(
                WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON |
                WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD |
                WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED |
                WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
        );

        setContentView(R.layout.activity_lock_overlay);

        String blockedPkg = getIntent().getStringExtra("blockedPackage");

        TextView msgText = findViewById(R.id.lock_message);
        TextView pkgText = findViewById(R.id.lock_package);
        Button backBtn = findViewById(R.id.lock_back_button);

        msgText.setText("🔒 Focus Lock Active");
        pkgText.setText("You blocked this app to stay focused.\nGet back to work!");

        backBtn.setText("Go Back to My Task");
        backBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent intent = new Intent(
                        LockOverlayActivity.this,
                        MainActivity.class
                );
                intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK |
                        Intent.FLAG_ACTIVITY_CLEAR_TOP);
                startActivity(intent);
                finish();
            }
        });
    }

    @Override
    public void onBackPressed() {
        // Block back button — user cannot escape
    }
}