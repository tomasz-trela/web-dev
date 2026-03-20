<?php
/**
 * Plugin Name: Random Announcements Basic
 * Plugin URI: https://example.com/plugins/random-announcements-basic/
 * Description: Displays a random HTML announcement between the post title and content.
 * Version: 1.0
 * Requires at least: 5.0
 * Requires PHP: 7.2
 * Author: BŁAŻEJ KOWAL
 */


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
			$lines = explode( "\n", wp_unslash( $_POST['rab_announcements'] ?? '' ) );
			$announcements = array_values( array_filter( array_map( 'trim', $lines ) ) );
			update_option( 'rab_announcements', $announcements );
			echo '<div class="notice notice-success is-dismissible"><p>Settings saved.</p></div>';
		}
	}

	$textarea_value = implode( "\n", get_option( 'rab_announcements', array() ) );
	?>
	<div class="wrap">
		<h1>Random Announcements</h1>
		<p>Enter announcements (one per line)</code></p>
		<form method="post">
			<input type="hidden" name="rab_do_save" value="Y">
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

function rab_inject_announcement( $content ) {
	if ( ! is_singular( 'post' ) || ! is_main_query() || ! in_the_loop() ) {
		return $content;
	}

	$announcements = get_option( 'rab_announcements', array() );

	if ( empty( $announcements ) ) {
		return $content;
	}

	$random = $announcements[ wp_rand( 0, count( $announcements ) - 1 ) ];

	return '<div class="rab-announcement">' . $random . '</div>' . $content;
}
add_filter( 'the_content', 'rab_inject_announcement' );



function rab_register_styles() {
	wp_register_style( 'rab-styles', plugins_url( 'css/random-announcements-basic.css', __FILE__ ), array(), '1.0.0' );
	wp_enqueue_style( 'rab-styles' );
}
add_action( 'init', 'rab_register_styles' );
