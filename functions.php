
function sync_fortknox_lager_chunks() {
  $result = array('message' => '');

  if (isset($_POST['method'])) {
    if ($_POST['method'] == 'get') {
      $cronjobProduct = Fortnox_Cronjob_Product::get_instance();
      $products = $cronjobProduct->get_available_products();

      // Extract 'ID' values from the products and send as JSON
      $flat = array_map(function ($item) {
        return $item['ID'];
      }, $products);

      wp_send_json($flat);
      die();
    } elseif ($_POST['method'] == 'update') {
      if (!isset($_POST['chunk'])) {
        wp_send_json(['message' => 'No chunks']);
        die();
      }

      $products = explode(',', $_POST['chunk']);

      if (empty($products) || count($products) <= 1) {
        wp_send_json(['message' => 'No products']);
        die();
      }

      foreach ($products as $product) {
        $stockResult = Obj_Fortnox_Product_Metabox::obj_fortnox_sync_product_stock($product);
        $result['message'] .= "($product) $stockResult[message]\n";
      }

      wp_send_json($result);
      die();
    }
  }

  wp_send_json(['message' => 'Wrong method']);
  die();
}
add_action('wp_ajax_sync_fortknox_lager_chunks', 'sync_fortknox_lager_chunks');
add_action('wp_ajax_nopriv_sync_fortknox_lager_chunks', 'sync_fortknox_lager_chunks');

function rl_fn_lager_sync()
{
  wp_enqueue_script('rl-fn-lager', get_stylesheet_directory_uri() . "/lager.js", array('jquery'), '1.0');
}
add_action('admin_footer', 'rl_fn_lager_sync');
