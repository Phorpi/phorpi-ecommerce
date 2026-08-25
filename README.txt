PHORPI — ecommerce.phorpi.com
=============================

Dosyalar:
  index.html
  styles.css
  script.js
  i18n/tr.json
  i18n/en.json

Kurulum:
  1) Bu klasördeki tüm dosyaları /home/phorpico/ecommerce/ altına atın
     (wholesale ile aynı yapı). Klasör yapısını KORUYUN — i18n/ alt klasörü şart.
  2) Ek build/derleme yok. FTP veya cPanel Dosya Yöneticisi ile atılınca yayında.

Dil sistemi:
  - Header'daki TR/EN seçici dili değiştirir.
  - ?lang=tr veya ?lang=en URL parametresi öncelikli.
  - localStorage seçimi hatırlar (phorpi.lang).
  - Tüm metinler i18n/tr.json ve i18n/en.json içindedir. Bir kart eklemek için
    services[] dizisine yeni bir nesne ekleyin; render otomatik.

Placeholder'lar (yayına almadan önce doldurun):
  - [FİYAT] / [PRICE]   — services + packages
  - [RAKAM] / [NUMBER]  — stats
  - [TELEFON], [NUMARA] / [PHONE], [NUMBER] — channels

Form:
  - Şu an client-side; submit üzerinde alert gösteriyor.
  - Prod'a alırken script.js içindeki 'quoteForm' submit handler'ını
    gonder.php veya Web3Forms/Formspree endpoint'ine bağlayın.
  - KVKK onay checkbox'ı required olarak zorunludur.

Notlar:
  - Google Fonts dışında bağımlılık yoktur.
  - Yatay taşma yok; mobil breakpoint 960px ve 520px'de.
  - Karşılaştırma tablosu 720px altında yatay kaydırılır.
