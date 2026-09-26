/* eslint-disable jsx-a11y/alt-text -- react-pdf <Image> is not a DOM element */
import React from "react";
import { Document, Page, View, Text, Image, StyleSheet, Svg, Rect, Font, renderToBuffer } from "@react-pdf/renderer";
import type { PublicListing } from "@/components/themes/types";
import { BRAND } from "@/lib/site";
import { formatINR } from "@/lib/format";
import { encodeQr, qrRects, type QrMatrix } from "./qr";
import { loadPhotos, photoAsJpeg } from "./images";
import { paletteFor, pdfText, TRANSACTION_LABEL, CATEGORY_LABEL, type OutputPalette } from "./theme";

Font.registerHyphenationCallback((w) => [w]);

type Input = { data: PublicListing; photos: Buffer[]; avatar: Buffer | null; qr: QrMatrix; p: OutputPalette };
const img = (b: Buffer) => ({ data: b, format: "jpg" as const });

const s = StyleSheet.create({
  page: { fontFamily: "Helvetica", fontSize: 10.5, color: "#161412", paddingBottom: 40 },
  cover: { width: "100%", height: 545, objectFit: "cover" },
  coverBlock: { padding: "28 40 30 40", flexGrow: 1, justifyContent: "flex-end" },
  eyebrow: { fontSize: 8.5, letterSpacing: 1.6, textTransform: "uppercase", marginBottom: 8 },
  h1: { fontFamily: "Helvetica-Bold", fontSize: 24, lineHeight: 1.15, marginBottom: 8 },
  price: { fontFamily: "Helvetica-Bold", fontSize: 20, marginBottom: 4 },
  sub: { fontSize: 11 },
  strip: { flexDirection: "row", alignItems: "center", marginTop: 16, paddingTop: 12, borderTopWidth: 1 },
  avatar: { width: 30, height: 30, borderRadius: 15, marginRight: 10, objectFit: "cover" },
  body: { padding: "40 40 30 40" },
  h2: { fontFamily: "Helvetica-Bold", fontSize: 15, marginBottom: 10, marginTop: 4 },
  grid: { flexDirection: "row", flexWrap: "wrap", marginBottom: 14 },
  cell: { width: "33.33%", paddingRight: 10, marginBottom: 10 },
  label: { fontSize: 8, letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 },
  value: { fontSize: 11, fontFamily: "Helvetica-Bold" },
  bullet: { flexDirection: "row", marginBottom: 4 },
  dot: { width: 6, height: 6, borderRadius: 3, marginTop: 4, marginRight: 8 },
  para: { fontSize: 10.5, lineHeight: 1.55 },
  photoGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  photo: { width: 252, height: 150, objectFit: "cover", marginBottom: 10, borderRadius: 6 },
  chips: { flexDirection: "row", flexWrap: "wrap", marginBottom: 12 },
  chip: { fontSize: 9, paddingVertical: 4, paddingHorizontal: 9, borderRadius: 10, marginRight: 6, marginBottom: 6 },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 5, borderBottomWidth: 1 },
  tile: { width: "50%", paddingRight: 10, marginBottom: 8 },
  footer: { position: "absolute", bottom: 18, left: 40, right: 40, flexDirection: "row", justifyContent: "space-between", fontSize: 8 },
  card: { borderRadius: 14, padding: 24, flexDirection: "row", alignItems: "center" },
  bigAvatar: { width: 72, height: 72, borderRadius: 36, marginRight: 20, objectFit: "cover" },
});

function Footer({ data, p }: { data: PublicListing; p: OutputPalette }) {
  return (
    <View style={[s.footer, { color: p.muted }]} fixed>
      <Text>{pdfText(data.title)}</Text>
      <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
    </View>
  );
}

function CoverPage({ data, photos, avatar, p }: Input) {
  const b = data.broker;
  const where = [data.locality, data.city].filter(Boolean).join(", ");
  return (
    <Page size="A4" style={[s.page, { backgroundColor: p.bg, color: p.ink }]}>
      {photos[0] ? <Image src={img(photos[0])} style={s.cover} /> : <View style={[s.cover, { backgroundColor: p.accent }]} />}
      <View style={s.coverBlock}>
        <Text style={[s.eyebrow, { color: p.accent }]}>
          {[TRANSACTION_LABEL[data.transaction], data.propertyType ?? CATEGORY_LABEL[data.category], data.urgencyBadge].filter(Boolean).join("  ·  ")}
        </Text>
        <Text style={s.h1}>{pdfText(data.title) || "Property"}</Text>
        <Text style={[s.price, { color: p.accent }]}>
          {pdfText(data.priceDisplay)}
          {data.negotiable ? "  (negotiable)" : ""}
        </Text>
        {where ? <Text style={[s.sub, { color: p.muted }]}>{where}</Text> : null}
        <View style={[s.strip, { borderTopColor: p.line }]}>
          {b.card.showNamePhoto && avatar ? <Image src={img(avatar)} style={s.avatar} /> : null}
          <View>
            {b.card.showNamePhoto ? <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 11 }}>{b.name}</Text> : null}
            <Text style={{ fontSize: 9, color: p.muted }}>
              {[b.card.showAgency ? b.agencyName : null, b.card.showCall ? b.phone : null].filter(Boolean).join("  ·  ")}
            </Text>
          </View>
        </View>
      </View>
    </Page>
  );
}

function facts(data: PublicListing): { label: string; value: string }[] {
  const f: [string, string | number | null | undefined][] = [
    ["Configuration", data.bhk],
    ["Area", data.areaLabel ?? (data.areaSqft ? `${data.areaSqft.toLocaleString("en-IN")} sq ft` : null)],
    ["Price per sq ft", data.perSqft ? pdfText(formatINR(data.perSqft, { compact: false })) : null],
    ["Property type", data.propertyType],
    ["Furnishing", data.furnishing],
    ["Floor", data.floor && data.totalFloors ? `${data.floor} of ${data.totalFloors}` : data.floor],
    ["Facing", data.facing],
    ["Age", data.ageOfProperty],
    ["Bathrooms", data.bathrooms],
    ["Balconies", data.balconies],
    ["Ownership", data.ownership],
    ["Parking", data.parking],
    ["Possession", data.possession],
    ["Loan", data.loanAvailable == null ? null : data.loanAvailable ? "Available" : "Not available"],
    ["Pincode", data.pincode],
  ];
  return f.filter(([, v]) => v != null && v !== "").map(([label, value]) => ({ label, value: String(value) }));
}

function DetailsPage({ data, p }: Input) {
  return (
    <Page size="A4" style={[s.page, { backgroundColor: "#ffffff" }]}>
      <View style={s.body}>
        <Text style={s.h2}>Key facts</Text>
        <View style={s.grid}>
          {facts(data).map((f) => (
            <View key={f.label} style={s.cell} wrap={false}>
              <Text style={[s.label, { color: p.muted }]}>{f.label}</Text>
              <Text style={s.value}>{f.value}</Text>
            </View>
          ))}
        </View>
        {data.priceLines.length ? (
          <View style={{ marginBottom: 16 }}>
            {data.priceLines.map((pl, i) => (
              <View key={i} style={[s.row, { borderBottomColor: p.line }]} wrap={false}>
                <Text>{pl.label}{pl.note ? `  (${pl.note})` : ""}</Text>
                <Text style={{ fontFamily: "Helvetica-Bold" }}>{pdfText(formatINR(pl.amount, { currency: data.currency }))}{pl.unit ? ` ${pl.unit}` : ""}</Text>
              </View>
            ))}
            {data.priceHistoryNote ? <Text style={{ fontSize: 9, color: p.muted, marginTop: 6 }}>{pdfText(data.priceHistoryNote)}</Text> : null}
          </View>
        ) : null}
        {data.highlights.length ? (
          <View style={{ marginBottom: 16 }}>
            <Text style={s.h2}>Highlights</Text>
            {data.highlights.map((h, i) => (
              <View key={i} style={s.bullet} wrap={false}>
                <View style={[s.dot, { backgroundColor: p.accent }]} />
                <Text>{pdfText(h)}</Text>
              </View>
            ))}
          </View>
        ) : null}
        {data.description ? (
          <View>
            <Text style={s.h2}>About this property</Text>
            <Text style={s.para}>{pdfText(data.description)}</Text>
          </View>
        ) : null}
      </View>
      <Footer data={data} p={p} />
    </Page>
  );
}

function GalleryPage({ data, photos, p }: Input) {
  const grid = photos.slice(1, 7);
  const hasMore = data.features.length || data.amenities.length || data.neighbourhood.length;
  if (!grid.length && !hasMore) return null;
  return (
    <Page size="A4" style={[s.page, { backgroundColor: "#ffffff" }]}>
      <View style={s.body}>
        {grid.length ? (
          <View style={s.photoGrid}>
            {grid.map((b, i) => (
              <Image key={i} src={img(b)} style={s.photo} />
            ))}
          </View>
        ) : null}
        {data.features.map((sec, i) => (
          <View key={sec.id ?? i} style={{ marginBottom: 8 }} wrap={false}>
            <Text style={s.h2}>{pdfText(sec.title)}</Text>
            <View style={s.grid}>
              {sec.items.map((it, j) => (
                <View key={it.id ?? j} style={s.tile} wrap={false}>
                  <Text style={[s.label, { color: p.muted }]}>{pdfText(it.label)}</Text>
                  <Text style={s.value}>{pdfText(it.value)}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
        {data.amenities.length ? (
          <View wrap={false}>
            <Text style={s.h2}>Amenities</Text>
            <View style={s.chips}>
              {data.amenities.map((a) => (
                <Text key={a} style={[s.chip, { backgroundColor: p.soft, color: p.ink }]}>{a}</Text>
              ))}
            </View>
          </View>
        ) : null}
        {data.neighbourhood.length ? (
          <View wrap={false}>
            <Text style={s.h2}>Neighbourhood</Text>
            {data.neighbourhood.map((n, i) => (
              <View key={i} style={[s.row, { borderBottomColor: p.line }]} wrap={false}>
                <Text>{pdfText(n.label)}</Text>
                <Text style={{ fontFamily: "Helvetica-Bold" }}>{pdfText(n.value)}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
      <Footer data={data} p={p} />
    </Page>
  );
}

function QrSvg({ qr, size, color }: { qr: QrMatrix; size: number; color: string }) {
  const q = 2;
  const total = qr.size + q * 2;
  return (
    <Svg viewBox={`0 0 ${total} ${total}`} width={size} height={size}>
      <Rect x={0} y={0} width={total} height={total} fill="#ffffff" />
      {qrRects(qr).map((r, i) => (
        <Rect key={i} x={r.x + q} y={r.y + q} width={1} height={1} fill={color} />
      ))}
    </Svg>
  );
}

function BrokerPage({ data, avatar, qr, p }: Input) {
  const b = data.broker;
  const wa = b.whatsapp ?? b.phone;
  return (
    <Page size="A4" style={[s.page, { backgroundColor: p.bg, color: p.ink }]}>
      <View style={[s.body, { flexGrow: 1, justifyContent: "center" }]}>
        <Text style={[s.eyebrow, { color: p.accent }]}>Get in touch</Text>
        <View style={[s.card, { backgroundColor: p.soft }]}>
          {b.card.showNamePhoto && avatar ? <Image src={img(avatar)} style={s.bigAvatar} /> : null}
          <View style={{ flexGrow: 1 }}>
            {b.card.showNamePhoto ? <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 18, marginBottom: 3 }}>{b.name}</Text> : null}
            {b.card.showAgency && b.agencyName ? <Text style={{ fontSize: 11, marginBottom: 2 }}>{b.agencyName}</Text> : null}
            {b.reraNumber ? <Text style={{ fontSize: 9, color: p.muted, marginBottom: 6 }}>RERA {b.reraNumber}</Text> : null}
            {b.card.showCall && b.phone ? <Text style={{ fontSize: 11 }}>Call: {b.phone}</Text> : null}
            {b.card.showWhatsApp && wa ? <Text style={{ fontSize: 11 }}>WhatsApp: {wa}</Text> : null}
            {b.card.showProfileLink ? <Text style={{ fontSize: 10, color: p.accent, marginTop: 4 }}>{b.siteUrl}</Text> : null}
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 30 }}>
          <View style={{ padding: 6, backgroundColor: "#ffffff", borderRadius: 8 }}>
            <QrSvg qr={qr} size={118} color="#111111" />
          </View>
          <View style={{ marginLeft: 20, flexShrink: 1 }}>
            <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 13, marginBottom: 4 }}>Scan to open this listing</Text>
            <Text style={{ fontSize: 9.5, color: p.muted }}>All photos, map, documents and one-tap WhatsApp.</Text>
            <Text style={{ fontSize: 9, color: p.accent, marginTop: 6 }}>{data.url}</Text>
          </View>
        </View>
      </View>
      <View style={[s.footer, { color: p.muted }]}>
        <Text>Made with {BRAND}</Text>
        <Text>{data.status === "SOLD" ? "Sold" : data.status === "RENTED" ? "Rented" : ""}</Text>
      </View>
    </Page>
  );
}

function BrochureDocument(input: Input) {
  return (
    <Document title={input.data.title} author={input.data.broker.name} producer={BRAND} creator={BRAND}>
      <CoverPage {...input} />
      <DetailsPage {...input} />
      <GalleryPage {...input} />
      <BrokerPage {...input} />
    </Document>
  );
}

// ── render + in-memory cache (10 minutes, keyed by id + updatedAt) ──
const cache = new Map<string, { buf: Buffer; at: number }>();
const TTL = 10 * 60 * 1000;

export async function renderBrochure(data: PublicListing): Promise<Buffer> {
  const [photos, avatar] = await Promise.all([
    loadPhotos(data.photos.slice(0, 7).map((p) => p.url)),
    data.broker.avatarUrl ? photoAsJpeg(data.broker.avatarUrl, 300) : Promise.resolve(null),
  ]);
  const qr = encodeQr(data.url);
  const p = paletteFor(data.theme);
  return renderToBuffer(<BrochureDocument data={data} photos={photos} avatar={avatar} qr={qr} p={p} />);
}

export async function getBrochurePdf(data: PublicListing, cacheKey: string): Promise<Buffer> {
  const hit = cache.get(cacheKey);
  if (hit && Date.now() - hit.at < TTL) return hit.buf;
  const buf = await renderBrochure(data);
  for (const [k, v] of cache) if (Date.now() - v.at > TTL || k.startsWith(data.id + ":")) cache.delete(k);
  cache.set(cacheKey, { buf, at: Date.now() });
  return buf;
}
