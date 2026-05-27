import { NextResponse } from "next/server";

export async function GET() {
  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Sana İyi Fiyat Mock XML</title>
    <link>https://sanaiyifiyat.com</link>
    <description>Mock XML Feed for testing</description>
    
    <item>
      <id>TEST-1001</id>
      <title>Apple iPhone 15 Pro Max 256 GB Titanyum</title>
      <description>Yeni nesil iPhone 15 Pro Max, muhteşem titanyum kasa.</description>
      <link>https://sanaiyifiyat.com/mock/iphone15</link>
      <image_link>https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-15-pro-max-natural-titanium-select</image_link>
      <price>74500.00 TRY</price>
      <category>Elektronik &gt; Cep Telefonu</category>
      <brand>Apple</brand>
      <gtin>195949032135</gtin>
    </item>

    <item>
      <id>TEST-1002</id>
      <title>Dyson Airwrap Multi-styler Saç Şekillendirici</title>
      <description>Coanda etkisi ile saçı aşırı ısıyla zarar vermeden şekillendirir.</description>
      <link>https://sanaiyifiyat.com/mock/dyson</link>
      <image_link>https://dyson-h.assetsadobe2.com/is/image/content/dam/dyson/images/products/primary/395833-01.png</image_link>
      <price>19999.00 TRY</price>
      <category>Kişisel Bakım &gt; Saç Şekillendirici</category>
      <brand>Dyson</brand>
      <gtin>5025155073289</gtin>
    </item>

    <item>
      <id>TEST-1003</id>
      <title>Samsung Galaxy S24 Ultra 512 GB Siyah</title>
      <description>Yapay zeka devrimi cebinizde.</description>
      <link>https://sanaiyifiyat.com/mock/s24</link>
      <image_link>https://images.samsung.com/is/image/samsung/p6pim/tr/2401/gallery/tr-galaxy-s24-s928-sm-s928bzkqtur-539300305</image_link>
      <price>69499.00 TRY</price>
      <category>Elektronik &gt; Cep Telefonu</category>
      <brand>Samsung</brand>
      <gtin>8806095382210</gtin>
    </item>

  </channel>
</rss>`;

  return new NextResponse(xmlContent, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
