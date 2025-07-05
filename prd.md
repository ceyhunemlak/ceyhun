# Tokat Emlak & Vasıta Sitesi - Ürün Gereksinim Belgesi (PRD)

## 1. Proje Genel Bakış

### 1.1 Amaç
Tokat Merkez'de faaliyet gösteren emlak ağırlıklı gayrimenkul şirketi için, firmaya özel kullanım imkanı sunan, dışarıdan kullanıcıların sadece görüntüleme yapabildiği bir emlak ve vasıta ilan sitesi geliştirilmesi.

### 1.2 Teknik Altyapı
- **Frontend Framework**: Next.js (Cursor AI ile geliştirme)
- **Görsel Depolama**: Cloudinary
- **Veri Tabanı**: Supabase
- **Tasarım Referansları**: Remax, Altın Emlak, Hepsiemlak (genel tasarım yapısı)

### 1.3 Kullanıcı Rolleri
- **Firma Kullanıcıları**: İlan ekleme, düzenleme, silme, yönetim paneli erişimi
- **Ziyaretçiler**: Sadece görüntüleme ve filtreleme

## 2. Tasarım Spesifikasyonları

### 2.1 Renk Paleti
- **Ana Renk**: #FFB000 (Altın Sarısı)
- **Yardımcı Renkler**: Siyah (#000000), Beyaz (#FFFFFF)

### 2.2 Tasarım Prensipleri
- Modern ve responsive tasarım
- Yuvarlatılmış köşeler (border-radius)
- Gölge efektleri (box-shadow)
- Gelişmiş hover efektleri ve animasyonlar
- Kullanıcı dostu arayüz

## 3. Sayfa Yapısı ve Özellikler

### 3.1 Ana Sayfa (/)

#### 3.1.1 Header
- **Merkez**: Şirket logosu
- **Sol**: Navigasyon menüsü (Ana Sayfa, Emlak, Vasıta)
- **Sağ**: Arama çubuğu

#### 3.1.2 Filtreleme Alanı
**Konum**: Sayfa üst-orta (Remax tarzı)
**Kategoriler**: 4 ana seçenek
1. **Konut**
   - Fiyat (min-max)
   - m² (min-max)
   - Oda sayısı
   - Satılık/Kiralık durumu
   - Konut tipi (Villa, Daire vb.)
   - Adres (İl/İlçe/Mahalle) - Varsayılan: Tokat Merkez

2. **Ticari**
   - Fiyat (min-max)
   - m² (min-max)
   - Oda sayısı
   - İş yeri tipi
   - Adres

3. **Arsa**
   - Fiyat (min-max)
   - m² (min-max)
   - Konum (Varsayılan: Tokat Merkez)
   - Arsa tipi

4. **Vasıta**
   - Direkt /vasıta sayfasına yönlendirme

#### 3.1.3 İçerik Alanı
- Önerilen ilan kartları
- Toplam ilan sayısı özeti (örn: 25 kiralık, 50 satılık, 15 vasıta)

#### 3.1.4 Footer
- Klasik footer yapısı
- İletişim bilgileri
- Hızlı linkler

### 3.2 İlanlar Sayfası (/ilanlar/[emlak|vasıta])

#### 3.2.1 Filtreleme Paneli (Sol Sidebar)
- Seçilen kategoriye göre dinamik filtreleme seçenekleri
- Fiyat ve m²: Min-max input kutuları
- Diğer özellikler: Dropdown ve boolean seçenekler
- Supabase'deki tüm veri alanlarına göre filtreleme

#### 3.2.2 İlan Listesi
- **Görünüm**: Yatay (horizontal) kart düzeni
- **İçerik**: 
  - Vitrin fotoğrafı
  - Başlık
  - Adres (vasıta hariç)
  - Fiyat
  - Önemli kategori bilgileri
- **Etkileşim**: Kartın herhangi bir yerine tıklama → İlan detay sayfası

#### 3.2.3 Kategori Geçiş
- Vasıta ↔ Emlak geçiş butonları
- Görünür konumda yerleştirme

### 3.3 İlan Detay Sayfası (/ilan/[başlık])

#### 3.3.1 Üst Bilgi Alanı
- Satılık/Kiralık durumu + Kategori
- Başlık (sola yaslanmış) | Fiyat (sağa yaslanmış)
- Adres bilgisi

#### 3.3.2 Galeri ve İletişim Alanı
**Sol**: 
- Fotoğraf galerisi (vitrin fotoğrafı öncelikli)
- Responsive galeri yapısı

**Sağ**:
- İletişim bilgileri:
  - Emlakçı fotoğrafı
  - Telefon numarası
  - WhatsApp butonu
- İlan özellikleri:
  - Ana özellikler vurgulanmış kutucuklarda
  - Kategori bazlı özellik gösterimi

#### 3.3.3 Açıklama Alanı
- Galeri altında, sağ kolonda kalan alana uygun
- Otomatik ortalama

#### 3.3.4 Benzer İlanlar
- Yatay kayan kartlar
- Sayfanın en altında

### 3.4 Admin Giriş (/admin)

#### 3.4.1 Güvenlik
- Harici kullanıcı erişimi engelli
- Kullanıcı adı: "admin"
- Parola: .env dosyasından "KULLANICI_SIFRE" değişkeni

#### 3.4.2 Giriş Formu
- Kullanıcı adı input
- Parola input
- Giriş butonu
- Başarılı giriş → /admin/panel yönlendirme

### 3.5 Admin Panel (/admin/panel)

#### 3.5.1 Dashboard
- Toplam görüntülenme sayıları
- Tıklanma istatistikleri
- İletişime geçme sayıları
- İlan bazlı performans metrikleri

#### 3.5.2 İlan Yönetimi
- Mevcut ilanlar listesi
- Aktif/Pasif durumu değiştirme
- İlan düzenleme
- İlan silme
- İlan ekleme

## 4. İlan Ekleme Sistemi

### 4.1 Adım 1: Kategori Seçimi

#### 4.1.1 Ana Kategoriler
```
Emlak
├── Konut
│   ├── Daire
│   ├── Villa
│   ├── Müstakil Ev
│   └── Bina
├── Ticari
│   ├── Dükkan
│   ├── Depo
│   ├── Villa
│   ├── Fabrika
│   ├── Atölye
│   ├── Plaza
│   ├── Bina
│   ├── Ofis
│   ├── Cafe
│   └── Büfe
└── Arsa
    ├── Tarla
    ├── Bahçe
    ├── Konut İmarlı
    └── Ticari İmarlı

Vasıta
├── Otomobil
├── SUV
├── ATV
├── UTV
├── Van
├── Motosiklet
├── Bisiklet
└── Ticari
```

#### 4.1.2 Satış/Kiralık Seçimi
- Emlak kategorileri için zorunlu
- Vasıta için geçerli değil

### 4.2 Adım 2: Bilgi Girişi

#### 4.2.1 Konut Bilgileri
| Alan | Tip | Zorunlu | Özellikler |
|------|-----|---------|------------|
| Başlık | Metin | ✓ | 100 karakter sınır, otomatik büyük harf |
| Açıklama | Metin | ✓ | - |
| Fiyat | Sayı | ✓ | - |
| m² Brüt | Sayı | ✓ | - |
| m² Net | Sayı | ✓ | - |
| Oda Sayısı | Dropdown | ✓ | 1+0, 1+1, 1+1.5, 2+1, 3+1, 4+1, 5+1, 5+2, 6+1, 6+2, 7+1, 7+2, 8+1 |
| Bina Yaşı | Dropdown | ✓ | Aralık değerleri |
| Bulunduğu Kat | Dropdown | ✓ | Aralık değerleri |
| Kat Sayısı | Dropdown | ✓ | Aralık değerleri |
| Isıtma | Dropdown | - | Doğalgaz, Soba, Merkezi, Yok |
| Balkon | Boolean | - | - |
| Asansör | Boolean | - | - |
| Eşyalı | Boolean | - | Sadece kiralık |
| Takas | Boolean | - | Sadece satılık |
| Krediye Uygun | Boolean | - | Sadece satılık |

#### 4.2.2 Ticari Bilgileri
| Alan | Tip | Zorunlu | Özellikler |
|------|-----|---------|------------|
| Başlık | Metin | ✓ | 100 karakter sınır, otomatik büyük harf |
| Açıklama | Metin | ✓ | - |
| Fiyat | Sayı | ✓ | - |
| m² Brüt | Sayı | ✓ | - |
| m² Net | Sayı | - | - |
| Oda Sayısı | Dropdown | ✓ | 1, 2, 3, 4, 5, 6, 7, 8, 9, 10+ |
| Bina Yaşı | Dropdown | ✓ | Aralık değerleri |
| Bulunduğu Kat | Dropdown | - | Aralık değerleri |
| Kat Sayısı | Dropdown | - | Aralık değerleri |
| Isıtma | Dropdown | - | - |
| Takas | Boolean | - | Sadece satılık |
| Krediye Uygun | Boolean | - | Sadece satılık |

#### 4.2.3 Arsa Bilgileri
| Alan | Tip | Zorunlu | Özellikler |
|------|-----|---------|------------|
| Başlık | Metin | ✓ | 100 karakter sınır, otomatik büyük harf |
| Açıklama | Zengin Metin | ✓ | - |
| Fiyat | Sayı | ✓ | - |
| m² | Sayı | ✓ | - |
| KAKS | Dropdown | - | Sadece konut imarlı |
| Takas | Boolean | - | Sadece satılık |
| Krediye Uygun | Boolean | - | Sadece satılık |

#### 4.2.4 Otomotiv Bilgileri
| Alan | Tip | Zorunlu | Özellikler |
|------|-----|---------|------------|
| Başlık | Metin | ✓ | 100 karakter sınır, otomatik büyük harf |
| Açıklama | Metin | ✓ | - |
| Marka | Metin | ✓ | - |
| Model | Metin | ✓ | - |
| Alt-Model | Metin | ✓ | - |
| Fiyat | Sayı | ✓ | - |
| KM | Sayı | ✓ | - |
| Yakıt | Dropdown | ✓ | - |
| Vites | Dropdown | - | - |
| Renk | Dropdown | - | - |
| Garanti | Boolean | - | - |
| Ağır Hasar Kayıtlı | Boolean | - | - |
| Takas | Boolean | - | - |

#### 4.2.5 Form Düzenleme Kuralları
- Zorunlu alanlar kırmızı "*" ile işaretlenir
- İlgili alanlar yan yana gruplandırılır
- Navigasyon koruması: Çıkış girişiminde popup uyarısı

### 4.3 Adım 3: Adres Bilgileri
- **Kapsam**: Vasıta hariç tüm kategoriler
- **Varsayılan**: Tokat/Merkez seçili
- **Seçenekler**: Tokat ili tüm ilçe ve mahalleleri
- **Zorunlu**: İl/İlçe/Mahalle seçimi

### 4.4 Adım 4: Fotoğraf Yükleme

#### 4.4.1 Sınırlamalar
- Maksimum 50 fotoğraf
- İlk sıradaki fotoğraf = Vitrin fotoğrafı
- Sürükle-bırak ile sıralama

#### 4.4.2 Cloudinary Entegrasyonu
- Kategori bazlı klasör yapısı
- İlan ID'si ile klasör adlandırması
- İlan silme/düzenleme durumunda Cloudinary senkronizasyonu

### 4.5 Adım 5: Önizleme
- **Özellikler**: 
  - Gerçek görünüm önizlemesi
  - "İlanı Tamamla" butonu
  - "Önceki Adıma Dön" butonu

## 5. Teknik Gereksinimler

### 5.1 Veri Tabanı (Supabase)
- İlan verileri için tablolar
- Kategori bazlı alan yapıları
- Filtreleme için indeksler
- İstatistik takibi

### 5.2 Görsel Yönetimi (Cloudinary)
- Kategori bazlı klasör yapısı
- Otomatik boyutlandırma
- Görsel optimizasyonu
- CDN entegrasyonu

### 5.3 Güvenlik
- Admin panel erişim kontrolü
- Environment variables kullanımı
- XSS koruması
- SQL injection koruması

### 5.4 Performans
- Lazy loading
- Image optimization
- Caching stratejileri
- Responsive design

## 6. Kullanıcı Deneyimi (UX)

### 6.1 Responsive Tasarım
- Mobile-first yaklaşım
- Tablet uyumluluğu
- Desktop optimizasyonu

### 6.2 Erişilebilirlik
- WCAG 2.1 uyumluluğu
- Klavye navigasyonu
- Screen reader desteği
- Renk kontrastı

### 6.3 Performans Metrikleri
- Sayfa yükleme süresi < 3 saniye
- Core Web Vitals optimizasyonu
- SEO optimizasyonu

## 7. Geliştirme Aşamaları

### 7.1 Faz 1: Temel Yapı
- Next.js kurulumu
- Supabase entegrasyonu
- Cloudinary konfigürasyonu
- Temel sayfa yapıları

### 7.2 Faz 2: İlan Sistemi
- İlan ekleme workflow'u
- Kategori yönetimi
- Fotoğraf yükleme sistemi

### 7.3 Faz 3: Admin Panel
- Kullanıcı authentication
- İlan yönetimi
- Dashboard ve istatistikler

### 7.4 Faz 4: Frontend ve UX
- Responsive tasarım
- Animasyonlar ve efektler
- Performans optimizasyonu

### 7.5 Faz 5: Test ve Deployment
- Unit testler
- Integration testler
- Production deployment
- Monitoring kurulumu

## 8. Başarı Metrikleri

### 8.1 Teknik Metrikler
- %99.9 uptime
- < 3 saniye sayfa yükleme
- Sıfır güvenlik açığı

### 8.2 Kullanıcı Metrikleri
- İlan görüntülenme oranları
- İletişime geçme oranları
- Kullanıcı geri bildirim puanları

### 8.3 İş Metrikleri
- İlan yönetimi verimliliği
- Müşteri memnuniyeti
- Platform kullanım oranları