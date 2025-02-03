<?php
/*
Plugin Name: SkipBooking
Description: Skip Booking plugin
Author: Developent Team (Ruel)
Version: 1.0
*/

function ch_booking_enqueue_style() {
	wp_enqueue_style( 'ch-booking-style', plugins_url() . '/skipbooking/booking-style.css', FALSE );
	// if (is_page('Book a Skip')) {
	// wp_enqueue_style('font-awesome', '//maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css');//for dev
	wp_enqueue_style( 'jquery-ui', '//code.jquery.com/ui/1.11.2/themes/smoothness/jquery-ui.min.css', array() );
	// }
}

function ch_booking_enqueue_script() {
	// if (is_page('Book a Skip')) {
	wp_enqueue_script( 'jquery-ui-core' );
	wp_enqueue_script( 'jquery-ui-datepicker' );
	wp_enqueue_script( 'ch-booking-script', plugins_url() . '/skipbooking/booking.js', array(
		'jquery',
		'jquery-ui-core',
		'jquery-ui-datepicker'
	), '1.7' );
	wp_localize_script( 'ch-booking-script', 'ajax_ch_booking_object', array(
		'ajaxurl'        => admin_url( 'admin-ajax.php' ),
		'redirecturl'    => $_SERVER['REQUEST_URI'],
		'loadingmessage' => __( 'Loading...' )
	) );
	// }
}
add_action( 'get_footer', 'ch_booking_enqueue_style' );
add_action( 'wp_enqueue_scripts', 'ch_booking_enqueue_script' );

function get_skip_price( $location, $size ) {
	// $pricelist = array(
	// 	'ST1' => array(
	// 		'2' => 
	// 	);
	// );
	// $result = '';
	// $row = 1;
	// $link = dirname(__FILE__) . '/pricelist.csv';
	// // print_r(PHP_EOL.$link.PHP_EOL);
	// // var_dump(file_exists($link));
	// $file = fopen($link, "r");
	// var_dump($file);
	// while(! feof($file)){
	//   print_r(fgetcsv($file));
	// }
	// fclose($file);
	// var_dump($handle = fopen($link, "r"));
	// if (($handle = fopen($link, "r")) !== FALSE) {
	//     while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
	//         $num = count($data);
	//         $result .= "<p> $num полей в строке $row: <br /></p>\n";
	//         $row++;
	//         for ($c=0; $c < $num; $c++) {
	//             echo $data[$c] . "<br />\n";
	//         }
	//     }
	//     fclose($handle);
	// }
	// return $result;
	// $content = file_get_contents($link);
	// print_r($content);
	// $csv = str_getcsv($content);
	// print_r($csv);
}

function ch_ajax_price_handler() {
	print_r( $_POST );
	if ( $_POST['method'] == 'get_price' ) {
		echo 'get_price';
		echo get_skip_price( 1, 1 );
	}
	die();
}
add_action( 'wp_ajax_ch_price_handler', 'ch_ajax_price_handler' );
add_action( 'wp_ajax_nopriv_ch_price_handler', 'ch_ajax_price_handler' );

function ch_ajax_booking_handler() {
	// print_r($_POST);
	$_product = get_page_by_title( 'Skip Hire', OBJECT, 'product' );
	global $woocommerce;
	$woocommerce->cart->add_to_cart( $_product->ID );
	echo get_permalink( get_page_by_title( 'Cart' ) );
	die();
}
add_action( 'wp_ajax_ch_booking_handler', 'ch_ajax_booking_handler' );
add_action( 'wp_ajax_nopriv_ch_booking_handler', 'ch_ajax_booking_handler' );

function ch_add_item_data( $cart_item_data, $product_id ) {
	global $woocommerce;
	$new_value                    = array();
	$new_value['_custom_options'] = $_POST['product'];
	if ( empty( $cart_item_data ) ) {
		return $new_value;
	} else {
		return array_merge( $cart_item_data, $new_value );
	}
}
add_filter( 'woocommerce_add_cart_item_data', 'ch_add_item_data', 1, 10 );

function ch_get_cart_items_from_session( $item, $values, $key ) {
	if ( array_key_exists( '_custom_options', $values ) ) {
		$item['_custom_options'] = $values['_custom_options'];
	}
	return $item;
}
add_filter( 'woocommerce_get_cart_item_from_session', 'ch_get_cart_items_from_session', 1, 3 );

function add_usr_custom_session( $product_name, $values, $cart_item_key ) {
	if ( empty( $values['_custom_options']['period'] ) ) {
		$values['_custom_options']['period'] = date( 'Y-m-d', strtotime( '+28 days' ) );
	}
	$councilSelected = $values['_custom_options']['council'] == 'Please select...' ? 'None' : $values['_custom_options']['council'];
	$return_string   = '<b><u>' . strip_tags( $product_name ) . "</u></b><br />" .
	                   '<span class="product-option-label">Size: </span>' . $values['_custom_options']['size'] . "<br />" .
	                   '<span class="product-option-label">Postcode: </span>' . $values['_custom_options']['postcode'] . "<br />" .
	                   '<span class="product-option-label">Period of Hire: </span>' . $values['_custom_options']['period'] . "<br />" .
	                   '<span class="product-option-label">Type of Waste: </span>' . $values['_custom_options']['wasteType'] . "<br />" .
	                   '<span class="product-option-label">Location: </span>' . $values['_custom_options']['landType'] . "<br />" .
	                   '<span class="product-option-label">Council: </span>' . $councilSelected . '<br />' ;
	return $return_string;
}
add_filter( 'woocommerce_cart_item_name', 'add_usr_custom_session', 1, 3 );

function ch_add_values_to_order_item_meta( $item_id, $values ) {
	global $woocommerce, $wpdb;
	wc_add_order_item_meta( $item_id, 'item_details', $values['_custom_options'] );
	// wc_add_order_item_meta($item_id, 'item_details', 'This is custom meta');
	// wc_add_order_item_meta($item_id, 'customer_image', $values['_custom_options']['another_example_field']);
	// wc_add_order_item_meta($item_id, '_hidden_field', $values['_custom_options']['hidden_info']);
}
add_action( 'woocommerce_add_order_item_meta', 'ch_add_values_to_order_item_meta', 1, 2 );

function order_meta_customized_display( $item_id, $item, $product ) {
	$item_meta = get_metadata( 'order_item', $item_id, 'item_details' );
	if ( ! empty( $item_meta ) ) {
		// echo '<pre>';
		// print_r($item_meta);
		// echo '</pre>';
		$item_meta = $item_meta[0];
		unset( $item_meta['price'] );
		echo '<h4>Order properties</h4>';
		if ( $item_meta && is_array( $item_meta ) ) {
			foreach ( $item_meta as $data_meta_key => $value ) {
				echo '<p><span style="display:inline-block; width:100px;">' . __( $data_meta_key ) . '</span><span>:&nbsp;' . $value . '</span></p>';
			}
		}
	}
}
add_action( 'woocommerce_after_order_itemmeta', 'order_meta_customized_display', 10, 3 );

function update_custom_price( $cart_object ) {
	if ( is_admin() && ! defined( 'DOING_AJAX' ) ) {
		return;
	}
	if ( $cart_object->get_cart() > 0 ) {
		foreach ( $cart_object->get_cart() as $key => $value ) {
			$value['data']->set_price( $value['_custom_options']['price'] );
		}
	}
}
add_action( 'woocommerce_before_calculate_totals', 'update_custom_price', 1, 1 );

add_filter( 'woocommerce_cart_item_thumbnail', '__return_false' );//Hide product thumbnails

function action_woocommerce_email_order_meta( $order, $sent_to_admin, $plain_text, $email ) {
	
	// $items        = $order->get_items();
	// $item         = array_shift( $items );
	// $item_meta    = access_protected_property( $item, 'meta_data' );
	// 
	// echo '<pre>';
	// print_r($item_details);
	// echo '</pre>';

	$items = $order->get_items();

	foreach ( $items as $item_key => $item_values ) {
		$item_data = $item_values->get_data();
		$item_datas = $item_data['meta_data'];
	}

	foreach ( $item_datas as $item_meta ) {
		$meta_data = $item_meta->value;
	}

	echo '<h2>Order details</h2>' . "<br/>";
	echo '<b>Period of Hire:</b> ' . $meta_data['period'] . "<br/>";
	echo '<b>Skip size:</b> ' . $meta_data['size'] . "<br/>";
	echo '<b>Postcode:</b> ' . $meta_data['postcode'] . "<br/>";
	echo '<b>Waste Type:</b> ' . $meta_data['wasteType'] . "<br/>";
	echo '<b>Location:</b> ' . $meta_data['landType'] . "<br/>";
	echo '<b>Council:</b> ' . $meta_data['council'] . "<br/>";
	echo '<br/>';
	
	echo 'Please see our reviews in <a href="https://www.google.co.uk/search?q=Black+Country+Skip+hire&ie=UTF-8&oe=UTF-8&hl=en-gb&client=safari#fpstate=lie&lkt=LocalPoiReviews">Google</a> and leave us a message in <a href="https://www.yell.com/reviews/places/addreview/id/901605411">Yell</a>.';
}
add_action( 'woocommerce_email_order_meta', 'action_woocommerce_email_order_meta', 10, 4 );
// add_action( 'woocommerce_email_after_order_table', 'action_woocommerce_email_order_meta', 10, 2 );

/*function access_protected_property($obj, $prop) {
	$reflection = new ReflectionClass($obj);
	$property = $reflection->getProperty($prop);
	$property->setAccessible(true);
	return $property->getValue($obj);
}*/

function ch_place_booking() {
	/*
		NEW CODES FROM CLIENTS THIS WILL BE SEEN ON THE SELECT TAG OR DROP DOWN MENU CALLED POSTCODE.
	*/
	$postcodes = array(
		'DY1',
		'DY2',
		'DY3',
		'DY4',
		'DY5',
		'DY6',
		'DY7',
		'DY8',
		'DY10',
		'WV1',
		'WV2',
		'WV3',
		'WV4',
		'WV5',
		'WV6',
		'WV7',
		'WV8',
		'WV9',
		'WV10',
		'WV11',
		'WV12',
		'WV13',
		'WV14',
		'ST19',
		'WS1',
		'WS2',
		'WS3',
		'WS4',
		'WS5',
		'WS6',
		'WS8',
		'WS9',
		'WS10',
		'WS11',
		'WS12',
		'B71',
		'B70',
		'B69',
		'B68',
		'B67',
		'B66',
		'B65',
		'B64',
		'B63',
		'B62',
		'B43',
		'B42',
		'B17',
		'B18',
		'B20',
		'B21',
		'B1',
		'B2',
		'B3',
		'B4',
		'B5'
	);
	ob_start(); ?>
    <form id="ch-booking-form" class="ch-booking-form" method="post" action="">
        <div class="ch-booking-form-header">
            <h1>Book your skip hire now</h1>
        </div>
        <div id="special-order-form" class="ch-booking-form-body group">
            <!-- <label for="skip-type-select" class="ch-form-label">Is the skip for Domestic or Commercial purposes?</label><br>
			<input type="hidden" id="skip-type-select" name="skip-type" value="domestic">
			<div class="chb-type-tabs">
				<span id="chb-type-domestic" class="chb-tab-selected" data-value="domestic">Domestic</span>
				<span id="chb-type-commercial" data-value="commercial">Commercial</span>
			</div> -->
            <div id="select_wrapper" class="group">
                <div class="sw_left sw group">
                    <label for="skip-size-select">1. Select your Skip Size:</label>
                    <select id="skip-size-select" name="skip-size">
						<?php
						$skip_size = $_GET["the_size"];
						if ( ! empty( $skip_size ) ) :
							switch ( $skip_size ) {
								case '2yrd':
									echo '<option value="0">Please select...</option>';
									echo '<option value="2" selected="selected">2yd</option>';
									echo '<option value="4">4yd</option>';
									echo '<option value="8">8yd</option>';
									break;
								case '4yrd':
									echo '<option value="0">Please select...</option>';
									echo '<option value="2">2yd</option>';
									echo '<option value="4" selected="selected">4yd</option>';
									echo '<option value="8">8yd</option>';
									break;
								case '8yrd':
									echo '<option value="0">Please select...</option>';
									echo '<option value="2">2yd</option>';
									echo '<option value="4">4yd</option>';
									echo '<option value="8" selected="selected">8yd</option>';
									break;
								default:
									break;
							}
						else:
							echo '<option value="0">Please select...</option>';
							echo '<option value="2">2yd</option>';
							echo '<option value="4">4yd</option>';
							echo '<option value="8">8yd</option>';
						endif;
						?>
                        <!-- <option value="10">10yd</option>
						<option value="12">12yd</option>
						<option value="14">14yd</option>
						<option value="12e">12yd enclosed</option> -->
                    </select>
                </div>
                <div class="sw_right sw group">
                    <label for="postcode-input">2. Postcode</label>
                    <!-- <input type="text" id="postcode-input" name="postcode" placeholder="*ST1"><br> -->
                    <select id="postcode-select" name="postcode">
                        <option value="XTAT" selected>Please select..</option>
                        <!-- option value="DY1" selected>DY1</option -->
						<?php foreach ( $postcodes as $code ) {
							echo '<option value="' . $code . '">' . $code . '</option>';
						} ?>
                    </select>
					<?php $skip_postcode = $_GET["the_postcode"];
					if ( ! empty( $skip_postcode ) ) { ?>
                        <script type="text/javascript">
                            jQuery(document).ready(function ($) {
                                jQuery("#postcode-select").val('<?php echo $skip_postcode; ?>').change();
                            });
                        </script>
					<?php } ?>
                </div>
            </div>
            <p id="qp-label" class="ch-form-label">Your Quoted Price:</p>
            <p id="xquoted-price">&pound;<span></span></p>
			<p style="padding:0 0 0 3%"><em><small>Price is inclusive VAT, applied to Skip Hire price only, not to Council permit fee.</small></em></p>
			<div id="the_dates_wrapper" class="group">
				<div class="td_left tdc group">
	            	<p class="ch-form-label">3. Period of Hire</p>
	                
	           <div class="group">
	                    <label for="hire-period-input-from" id="from-date-label">From: </label>
	                    <input type="text" readonly="readonly" id="hire-period-input-from" name="hire-period" class="hire-period" placeholder="/    /"><span
	                            class="calendar-icon"
	                            data-for="hire-period-input-from"><i
	                                class="fa fa-calendar" aria-hidden="true"></i></span>
	                </div>

 <div class="group">
	                    <label for="hire-period-input-until" id="until-date-label">Until: </label>
	                    <input type="text" readonly="readonly" id="hire-period-input-until" name="hire-period" class="hire-period" placeholder="/    /" style="margin-left: 19px;"><span
	                            class="calendar-icon"
	                            data-for="hire-period-input-until"><i
	                                class="fa fa-calendar" aria-hidden="true"></i></span>
	                </div>   


		        </div>
		        <div class="td_right tdc group">
		            <p class="ch-form-label">Delivery Times</p>
		            <ul style="padding-left: 18px;">
		            	<li>Monday – Friday, 7.30am – 4.30pm</li>
		            	
		        	</ul>
		        </div>
	       	</div> 
            <p class="note december-date-note"></p>
            <p class="ch-form-label">4. Type of Waste:</p>
            <div class="group input_lables_wrapper">
                <div class="inputbt_wrapper group">
                    <input type="radio" name="waste-type" id="waste-type-general" value="general" checked>
                    <label for="waste-type-general" class="ch-form-radio-label">General</label>
                </div>
                <div class="inputbt_wrapper group">
                    <input type="radio" name="waste-type" id="waste-type-bs" value="bs">
                    <label for="waste-type-bs" class="ch-form-radio-label">Plasterboard</label>
                </div>
            </div>			
            <p class="note">Note: if there is any hazardous waste such as asbestos it will be returned back to the customer as is unacceptable, there is
                            any special waste a different price will need to be given over the phone according to what it is</p>
            <p class="ch-form-label">5. Where will the skip be kept?</p>
            <div class="group input_lables_wrapper">
                <div class="inputbt_wrapper group">
                    <input type="radio" name="land-type" id="land-type-private" value="private" checked>
                    <label for="land-type-private" class="ch-form-radio-label">Private Land</label>
                </div>
                <div class="inputbt_wrapper group">
                    <input type="radio" name="land-type" id="land-type-public" value="public">
                    <label for="land-type-public" class="ch-form-radio-label">On Public Road</label>
                </div>
            </div>
            <!-- <div class="parking-permit-wrapper">
                <p class="ch-form-label">Is a On-road Permit required for this street?</p>
                <div class="group input_lables_wrapper">
                    <div class="inputbt_wrapper group">
                        <input type="radio" name="parking-permit" id="parking-permit-none" value="no" checked>
                        <label for="parking-permit-none" class="ch-form-radio-label">No</label>
                    </div>
                    <div class="inputbt_wrapper group">
                        <input type="radio" name="parking-permit" id="parking-permit-required" value="yes">
                        <label for="parking-permit-required" class="ch-form-radio-label">Yes</label>
                    </div>
                </div>
            </div> -->
            <div class="addons-parking-permit-wrapper">
                <p class="ch-form-label">6. An on-road permit will be required for this. Please select which council:</p>
                <div class="group input_lables_wrapper">
                    <select id="council-options" name="council">
                        <option value="0" selected="selected">Please select...</option>
                        <option value="1">Dudley Council</option>
                        <option value="2">Wolverhampton Council</option>
                        <option value="3">Walsall Council</option>
                        <option value="4">Sandwell Council</option>
                    </select>
                </div>
            </div>
            <div id="sof_footer" class="group">
                <div class="sof_left sof group">
                    <div class="ch-form-float-container">
                        <p class="ch-form-label" style="display: none">Your Quoted Price:</p>
                        <p id="quoted-price" style="display: none">&pound;<span></span></p>
                    </div>
                </div>
                <div class="sof_right sof group">
                    <div class="ch-form-float-container book-and-pay group">
                        <div class="bap group">
                            <p class="ch-form-label">Book &amp; Pay:</p>
                            <i class="fa fa-credit-card" aria-hidden="true"></i><i class="fa fa-paypal" aria-hidden="true"></i>
                        </div>
                        <button type="button" id="ch-book-now">BOOK NOW</button>
                    </div>
                </div>
            </div>
        </div>
        <div class="ch-booking-form-footer">
            <input type="hidden" id="form-sent" value="no">
        </div>
    </form>
	<?php return ob_get_clean();
}
add_shortcode( 'ch_booking', 'ch_place_booking' );


function ch_wc_return_to_shop_text( $translated_text, $text, $domain ) {
        switch ( $translated_text ) {
            case 'Return to shop' :
                $translated_text = __( 'Return to Skip Hire', 'woocommerce' );
                break;
        }
    return $translated_text;
}
add_filter( 'gettext', 'ch_wc_return_to_shop_text', 20, 3 );

/**
 * Changes the redirect URL for the Return To Shop button in the cart.
 *
 * @return string
 */
function ch_empty_cart_redirect_url() {
	return home_url( '/order-page/' );
}
add_filter( 'woocommerce_return_to_shop_redirect', 'ch_empty_cart_redirect_url' );

function ch_shop_page_redirect() {
    if( is_shop() ){
        wp_redirect( home_url( '/order-page/' ) );
        exit();
    }

    if( is_product('Skip Hire') ){
        wp_redirect( home_url( '/order-page/' ) );
        exit();
    }
}
add_action( 'template_redirect', 'ch_shop_page_redirect' );