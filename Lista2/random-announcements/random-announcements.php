<?php
/**
 * Plugin Name: Random Announcements
 * Plugin URI: https://example.com/plugins/random-announcements/
 * Description: Displays a random HTML announcement between the post title and content.
 * Version: 1.0
 * Requires at least: 5.0
 * Requires PHP: 7.2
 * Author: BLAZEJ KOWAL
 */

define( 'RAB_ANNOUNCEMENTS_OPTION', 'rab_announcements' );
define( 'RAB_ENABLED_OPTION', 'rab_enabled' ); /**global option name for announcements */
define( 'RAB_DISABLE_META', '_rab_disable_announcement' ); /**post meta name for disabling announcements on specific post */

function rab_admin_actions_register_menu() {
	add_options_page(
		'Random Announcements',
		'Random Announcements',
		'manage_options',
		'rab-settings',
		'rab_admin_page'
	);
}
add_action( 'admin_menu', 'rab_admin_actions_register_menu' );

function rab_admin_page() {
	global $_POST;

	if ( isset( $_POST['rab_do_save'] ) ) {
		if ( $_POST['rab_do_save'] == 'Y' ) {
			check_admin_referer( 'rab_save_settings' ); //security check for form submission

			$lines = explode( "\n", wp_unslash( $_POST['rab_announcements'] ?? '' ) );
			$announcements = array_values( array_filter( array_map( 'trim', $lines ) ) );
			$enabled = isset( $_POST['rab_enabled'] ) ? 1 : 0;		//for global option
			update_option( RAB_ANNOUNCEMENTS_OPTION, $announcements );
			update_option( RAB_ENABLED_OPTION, $enabled ); //for global option
			echo '<div class="notice notice-success is-dismissible"><p>Settings saved.</p></div>';
		}
	}

	$textarea_value = implode( "\n", get_option( RAB_ANNOUNCEMENTS_OPTION, array() ) );
	$enabled = get_option( RAB_ENABLED_OPTION, 1 ); //for global option
	?>
	<div class="wrap">
		<h1>Random Announcements</h1>
		<p>Enter announcements (one per line).</p>
		<form method="post">
			<?php wp_nonce_field( 'rab_save_settings' ); ?> 
			<input type="hidden" name="rab_do_save" value="Y">
			<p>
				<label>
					<input type="checkbox" name="rab_enabled" value="1" <?php checked( 1, (int) $enabled ); ?>>
					Enable plugin on posts
				</label>
			</p>
			<p>
				<label for="rab_announcements"><strong>Announcements:</strong></label><br>
				<textarea id="rab_announcements" name="rab_announcements" rows="10" class="large-text code"><?php echo esc_textarea( $textarea_value ); ?></textarea>
			</p>
			<p class="submit">
				<input type="submit" class="button-primary" value="Save Settings">
			</p>
		</form>
	</div>
	<?php
}

function rab_get_random_announcement() { //get random announcement from options for better code organization and reusability
	$announcements = get_option( RAB_ANNOUNCEMENTS_OPTION, array() );

	if ( empty( $announcements ) ) {
		return null;
	}

	return $announcements[ wp_rand( 0, count( $announcements ) - 1 ) ];
}

function rab_inject_announcement( $content ) { //inject announcement into post content with checks for global and post-specific settings
	if ( ! is_singular( 'post' ) || ! is_main_query() || ! in_the_loop() ) {
		return $content;
	}

	if ( ! get_option( RAB_ENABLED_OPTION, 1 ) ) {
		return $content;
	}

	if ( get_post_meta( get_the_ID(), RAB_DISABLE_META, true ) ) {
		return $content;
	}

	$random = rab_get_random_announcement(); //get random announcement from separate function

	if ( null === $random ) {
		return $content;
	}

	return '<div class="rab-announcement">' . $random . '</div>' . $content;
}
add_filter( 'the_content', 'rab_inject_announcement' );

function rab_register_dashboard_widget() { //register dashboard widget for previewing random announcement
	wp_add_dashboard_widget(
		'rab_dashboard_preview',
		'Random Announcements Preview',
		'rab_render_dashboard_widget'
	);
}
add_action( 'wp_dashboard_setup', 'rab_register_dashboard_widget' );

function rab_render_dashboard_widget() { //render content of dashboard widget
	if ( ! get_option( RAB_ENABLED_OPTION, 1 ) ) {
		echo '<p>Plugin is currently disabled in settings.</p>';
		return;
	}

	$random = rab_get_random_announcement(); //get random announcement using the same function as in content injection for consistency

	if ( null === $random ) {
		echo '<p>No announcements configured yet.</p>';
		return;
	}

	echo '<p>Sample announcement shown on posts:</p>';
	echo '<div class="rab-announcement">' . $random . '</div>';
}

function rab_add_meta_box() { //add meta box to post edit screen for disabling announcement on specific post
	add_meta_box(
		'rab-post-settings',
		'Random Announcements',
		'rab_render_meta_box',
		'post',
		'side'
	);
}
add_action( 'add_meta_boxes', 'rab_add_meta_box' );

function rab_render_meta_box( $post ) { //render content of meta box
	$disabled = get_post_meta( $post->ID, RAB_DISABLE_META, true );
	wp_nonce_field( 'rab_save_post_settings', 'rab_post_settings_nonce' ); //security field for meta box form submission
	?>
	<label>
		<input type="checkbox" name="rab_disable_announcement" value="1" <?php checked( 1, (int) $disabled ); ?>>
		Disable announcement for this post
	</label>
	<?php
}

function rab_save_post_settings( $post_id ) { //save meta box settings when post is saved
	if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
		return;
	}

	if ( ! isset( $_POST['rab_post_settings_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['rab_post_settings_nonce'] ) ), 'rab_save_post_settings' ) ) { //security check for meta box form submission
		return;
	}

	if ( ! current_user_can( 'edit_post', $post_id ) ) {
		return;
	}

	update_post_meta( $post_id, RAB_DISABLE_META, isset( $_POST['rab_disable_announcement'] ) ? 1 : 0 );
}
add_action( 'save_post_post', 'rab_save_post_settings' );

function rab_register_styles() {
	wp_register_style( 'rab-styles', plugins_url( 'css/random-announcements.css', __FILE__ ), array(), '1.0.0' );
	wp_enqueue_style( 'rab-styles' );
}
add_action( 'init', 'rab_register_styles' );
