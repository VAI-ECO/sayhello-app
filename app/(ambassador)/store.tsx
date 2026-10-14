/**
 * A7 AMBASSADOR SHOP — the same catalog journey as Waverly's Place, served to Ambassadors
 * (`?shop=ambassador`: audience-filtered products, no points, §4.12). Catalog rows are admin data; with none
 * the shop says "No items yet". Payment needs a real provider (see /store/orders/:id/pay).
 */
import { Redirect } from 'expo-router';

export default function AmbassadorStoreScreen() {
  return <Redirect href={{ pathname: '/(store)', params: { shop: 'ambassador' } } as never} />;
}
