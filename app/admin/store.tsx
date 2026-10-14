/**
 * HELLO ADMIN › STORE CATALOG — Waverly's Place products, sizes/colours and who may see each (RULES §4, §22.4).
 * Retail is derived from cost plus the markup in Settings, so there is no price field. Nothing is deleted: a
 * product is switched off and a category is retired. Looking needs settings.view; changing needs settings.edit
 * (the server checks again and writes Audit). No fulfilment lives here — see Orders and stands.
 */
import { useState } from 'react';
import { View, Text, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { t } from '../../src/i18n';
import {
  getStoreProducts, getStoreCategories, createStoreProduct, updateStoreProduct, createStoreVariant, setStoreVariantAvailable,
  createStoreCategory, setStoreCategoryRetired, uploadStoreProductPhoto, deleteStoreProductPhoto, reorderStoreProductPhotos, type StoreProductRow, type StoreCategoryRow,
} from '../../src/api/admin-store';
import { AdminShell, useAdminMe } from '../../src/components/admin/AdminShell';
import { Card, Eyebrow } from '../../src/components/role/RoleShell';
import { useLoader } from '../../src/lib/use-loader';
import { formatCents } from '../../src/lib/money-format';
import { Loaded, Btn, Field, Pill, Seg, adminStyles as s } from '../../src/components/admin/AdminParts';
import { toArrayBuffer } from '../../src/lib/photo-bytes';
import { toUploadablePhoto } from '../../src/lib/photo-normalize';
import { getPhotoMaxEdge } from '../../src/lib/photo-config';
import { w3ErrorText } from '../../src/components/admin/storeErrors';

type Aud = 'member' | 'ambassador' | 'both';
const audLabel = (a: Aud) => t(a === 'member' ? 'adminW3.store.audienceMember' : a === 'ambassador' ? 'adminW3.store.audienceAmbassador' : 'adminW3.store.audienceBoth');
const toCents = (v: string) => Math.round(Number(v) * 100);

function ProductCard({ p, canEdit, onDone }: { p: StoreProductRow; canEdit: boolean; onDone: () => void }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [cost, setCost] = useState('');
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [sku, setSku] = useState('');
  async function run(fn: () => Promise<{ data?: unknown; error?: { code?: string } } | undefined>, after?: () => void) {
    setBusy(true); setMsg(null);
    const r = await fn();
    setBusy(false);
    if (r?.data) { after?.(); onDone(); } else setMsg(w3ErrorText(r?.error?.code));
  }
  const photos = [...(p.photos ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);
  // Library pick -> resized to the owner-set max edge (or the built-in cap) -> JPEG/PNG bytes -> server strips metadata.
  async function addPhoto() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== 'granted') { setMsg(t('adminW3.store.photoPermission')); return; }
    const picked = await ImagePicker.launchImageLibraryAsync({ allowsEditing: false, quality: 0.8, base64: true });
    if (picked.canceled || !picked.assets[0]) return;
    const ready = await toUploadablePhoto(picked.assets[0], await getPhotoMaxEdge());
    if (!ready) { setMsg(t('adminW3.store.photoUnsupported')); return; }
    await run(() => uploadStoreProductPhoto(p.id, toArrayBuffer(ready.bytes), ready.mime));
  }
  const movePhoto = (i: number, dir: -1 | 1) => {
    const ids = photos.map((x) => x.id);
    const j = i + dir;
    if (j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j], ids[i]];
    void run(() => reorderStoreProductPhotos(p.id, ids));
  };
  const variants = [...p.storeVariants].sort((a, b) => a.sortOrder - b.sortOrder);
  return (
    <Card testID={`admin-product-${p.id}`}>
      <View style={s.row}>
        <Text style={s.title}>{p.name}</Text>
        <Pill tone={p.active ? 'ok' : undefined} text={t(p.active ? 'adminW3.store.active' : 'adminW3.store.off')} />
      </View>
      <Text style={s.small}>{t('adminW3.store.costLine', { cost: formatCents(p.costCents) })} · {audLabel(p.audience)}</Text>
      {p.description ? <Text style={s.body}>{p.description}</Text> : null}
      <Eyebrow>{t('adminW3.store.photos')}</Eyebrow>
      {photos.length === 0 ? <Text style={s.body} testID={`admin-product-${p.id}-nophotos`}>{t('adminW3.store.photosEmpty')}</Text> : null}
      {photos.map((ph, i) => (
        <View key={ph.id} style={s.gap} testID={`admin-photo-${ph.id}`}>
          {ph.url ? <Image source={{ uri: ph.url }} style={{ height: 120, borderRadius: 8 }} resizeMode="cover" /> : null}
          {canEdit ? (
            <View style={s.row}>
              <Btn kind="outline" busy={busy} disabled={i === 0} label={t('adminW3.store.photoUp')} onPress={() => movePhoto(i, -1)} testID={`admin-photo-up-${ph.id}`} />
              <Btn kind="outline" busy={busy} disabled={i === photos.length - 1} label={t('adminW3.store.photoDown')} onPress={() => movePhoto(i, 1)} testID={`admin-photo-down-${ph.id}`} />
              <Btn kind="outline" busy={busy} label={t('adminW3.store.photoRemove')} onPress={() => run(() => deleteStoreProductPhoto(ph.id))} testID={`admin-photo-remove-${ph.id}`} />
            </View>
          ) : null}
        </View>
      ))}
      {canEdit ? <Btn kind="outline" busy={busy} label={t('adminW3.store.photoAdd')} onPress={() => void addPhoto()} testID={`admin-photo-add-${p.id}`} /> : null}
      <Eyebrow>{t('adminW3.store.variants')}</Eyebrow>
      {variants.length === 0 ? <Text style={s.body} testID={`admin-product-${p.id}-novariants`}>{t('adminW3.store.variantsEmpty')}</Text> : null}
      {variants.map((v) => (
        <View key={v.id} style={s.gap} testID={`admin-variant-${v.id}`}>
          <View style={s.row}>
            <Text style={s.body}>{[v.sizeLabel, v.garmentColor, v.sku].filter(Boolean).join(' · ') || '—'}</Text>
            <Pill tone={v.available ? 'ok' : 'warn'} text={t(v.available ? 'adminW3.store.variantAvailable' : 'adminW3.store.variantSoldOut')} />
          </View>
          {canEdit ? <Btn kind="outline" busy={busy} label={t(v.available ? 'adminW3.store.markUnavailable' : 'adminW3.store.markAvailable')} onPress={() => run(() => setStoreVariantAvailable(v.id, !v.available))} testID={`admin-variant-toggle-${v.id}`} /> : null}
        </View>
      ))}
      {canEdit ? (
        <View style={s.gap}>
          <Field label={t('adminW3.store.size')} value={size} onChange={setSize} testID={`admin-variant-size-${p.id}`} />
          <Field label={t('adminW3.store.color')} value={color} onChange={setColor} testID={`admin-variant-color-${p.id}`} />
          <Field label={t('adminW3.store.sku')} value={sku} onChange={setSku} testID={`admin-variant-sku-${p.id}`} />
          <Btn kind="outline" busy={busy} disabled={!size.trim() && !color.trim()} label={t('adminW3.store.addVariant')}
            onPress={() => run(() => createStoreVariant(p.id, { sizeLabel: size.trim() || undefined, garmentColor: color.trim() || undefined, sku: sku.trim() || undefined }), () => { setSize(''); setColor(''); setSku(''); })} testID={`admin-variant-add-${p.id}`} />
          <Field label={t('adminW3.store.cost')} value={cost} onChange={setCost} keyboard="numeric" testID={`admin-product-cost-${p.id}`} />
          <Btn kind="outline" busy={busy} disabled={!(Number(cost) >= 0) || cost.trim() === ''} label={t('adminW3.store.editCost')}
            onPress={() => run(() => updateStoreProduct(p.id, { costCents: toCents(cost) }), () => { setCost(''); setMsg(t('adminW3.store.costSaved')); })} testID={`admin-product-cost-save-${p.id}`} />
          <Btn kind="outline" busy={busy} label={t(p.active ? 'adminW3.store.switchOff' : 'adminW3.store.switchOn')} onPress={() => run(() => updateStoreProduct(p.id, { active: !p.active }))} testID={`admin-product-active-${p.id}`} />
        </View>
      ) : null}
      {msg ? <Text style={s.body} accessibilityRole="alert">{msg}</Text> : null}
    </Card>
  );
}

export default function AdminStoreScreen() {
  const { me } = useAdminMe();
  const canEdit = me?.permissions.includes('settings.edit') ?? false;
  const l = useLoader(async () => {
    const [p, c] = await Promise.all([getStoreProducts(), getStoreCategories()]);
    if (p?.data && c?.data) return { data: { products: p.data.products, categories: c.data.categories } };
    return (p && p.error ? { error: p.error } : c && c.error ? { error: c.error } : undefined);
  });
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [cost, setCost] = useState('');
  const [aud, setAud] = useState<Aud>('member');
  const [prodCat, setProdCat] = useState<string | null>(null);
  const [catName, setCatName] = useState('');
  const [catParent, setCatParent] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function addProduct() {
    const r = await createStoreProduct({ name: name.trim(), costCents: toCents(cost), audience: aud, description: desc.trim() || undefined, categoryId: prodCat });
    if (r?.data) { setName(''); setDesc(''); setCost(''); setMsg(null); l.reload(); } else setMsg(w3ErrorText(r?.error?.code));
  }
  async function addCategory() {
    const r = await createStoreCategory(catName.trim(), catParent);
    if (r?.data) { setCatName(''); setMsg(null); l.reload(); } else setMsg(w3ErrorText(r?.error?.code));
  }
  async function retire(c: StoreCategoryRow) {
    const r = await setStoreCategoryRetired(c.id, !c.retiredAt);
    if (r?.data) { setMsg(null); l.reload(); } else setMsg(w3ErrorText(r?.error?.code));
  }

  return (
    <AdminShell active="store" title={t('adminW3.store.title')} subtitle={t('adminW3.store.lead')} refreshing={l.refreshing} onRefresh={l.onRefresh} testID="admin-store">
      {me && !canEdit ? <Text style={s.small} testID="admin-store-viewonly">{t('adminW3.store.canEditNote')}</Text> : null}
      <Loaded l={l} id="admin-store-data">
        {(d) => {
          const tops = d.categories.filter((c) => !c.parentId);
          return (
            <View style={s.gap}>
              <Eyebrow>{t('adminW3.store.products')}</Eyebrow>
              {d.products.length === 0 ? <Card testID="admin-store-empty"><Text style={s.body}>{t('adminW3.store.productsEmpty')}</Text></Card> : null}
              {d.products.map((p) => <ProductCard key={p.id} p={p} canEdit={canEdit} onDone={l.reload} />)}
              {canEdit ? (
                <Card testID="admin-store-new">
                  <Eyebrow>{t('adminW3.store.newProduct')}</Eyebrow>
                  <Field label={t('adminW3.store.name')} value={name} onChange={setName} testID="admin-store-new-name" />
                  <Field label={t('adminW3.store.description')} value={desc} onChange={setDesc} multiline testID="admin-store-new-desc" />
                  <Field label={t('adminW3.store.cost')} value={cost} onChange={setCost} keyboard="numeric" testID="admin-store-new-cost" />
                  <Seg id="admin-store-new-audience" value={aud} onChange={setAud} options={[{ key: 'member', label: t('adminW3.store.audienceMember') }, { key: 'ambassador', label: t('adminW3.store.audienceAmbassador') }, { key: 'both', label: t('adminW3.store.audienceBoth') }]} />
                  <Text style={s.small}>{t('adminW3.store.categories')}</Text>
                  <View style={s.gap}>
                    <Btn label={t('adminW3.common.none')} kind={prodCat === null ? 'primary' : 'outline'} onPress={() => setProdCat(null)} testID="admin-store-new-cat-none" />
                    {d.categories.filter((c) => !c.retiredAt).map((c) => <Btn key={c.id} label={c.name} kind={prodCat === c.id ? 'primary' : 'outline'} onPress={() => setProdCat(c.id)} testID={`admin-store-new-cat-${c.id}`} />)}
                  </View>
                  <Btn label={t('adminW3.store.create')} disabled={!name.trim() || cost.trim() === '' || !(Number(cost) >= 0)} onPress={addProduct} testID="admin-store-new-create" />
                </Card>
              ) : null}
              <Eyebrow>{t('adminW3.store.categories')}</Eyebrow>
              {d.categories.length === 0 ? <Card testID="admin-store-cats-empty"><Text style={s.body}>{t('adminW3.store.categoriesEmpty')}</Text></Card> : null}
              {d.categories.map((c) => (
                <Card key={c.id} testID={`admin-store-cat-${c.id}`}>
                  <View style={s.row}>
                    <Text style={[s.title, c.parentId ? { paddingLeft: 18 } : null]}>{c.name}</Text>
                    {c.retiredAt ? <Pill text={t('adminW3.store.retired')} /> : null}
                  </View>
                  {canEdit ? <Btn kind="outline" label={t(c.retiredAt ? 'adminW3.store.restore' : 'adminW3.store.retire')} onPress={() => retire(c)} testID={`admin-store-cat-retire-${c.id}`} /> : null}
                </Card>
              ))}
              {canEdit ? (
                <Card testID="admin-store-cat-new">
                  <Field label={t('adminW3.store.categoryName')} value={catName} onChange={setCatName} testID="admin-store-cat-name" />
                  <Text style={s.small}>{t('adminW3.store.categoryParent')}</Text>
                  <View style={s.gap}>
                    <Btn label={t('adminW3.store.categoryTop')} kind={catParent === null ? 'primary' : 'outline'} onPress={() => setCatParent(null)} testID="admin-store-cat-parent-none" />
                    {tops.filter((c) => !c.retiredAt).map((c) => <Btn key={c.id} label={c.name} kind={catParent === c.id ? 'primary' : 'outline'} onPress={() => setCatParent(c.id)} testID={`admin-store-cat-parent-${c.id}`} />)}
                  </View>
                  <Btn label={t('adminW3.store.categoryAdd')} disabled={!catName.trim()} onPress={addCategory} testID="admin-store-cat-add" />
                </Card>
              ) : null}
              {msg ? <Text style={s.body} accessibilityRole="alert" testID="admin-store-message">{msg}</Text> : null}
            </View>
          );
        }}
      </Loaded>
    </AdminShell>
  );
}
