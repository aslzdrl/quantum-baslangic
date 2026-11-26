# Quantum Başlangıç

Bu depo, Quantum Team Blokzincir Oryantasyon İş Paketi kapsamında
hazırladığım araştırma notlarını ve eğitim cüzdanı uygulamamı içeriyor.

Bu çalışmada Ethereum işlemlerinin nasıl gönderildiğini ve doğrulandığını,
bir cüzdanın rastgele veriden nasıl oluşturulduğunu ve akıllı sözleşmelerin
bir web arayüzünden nasıl kullanılabildiğini öğrenmeyi hedefliyorum.

## Araştırma notları

Araştırma cevaplarımı ve uygulama gözlemlerimi
[QT-blockchain_AZD.docx](arastirma-notlari/QT-blockchain_AZD.docx)
dosyasında tutuyorum.

## Kullanılan araçlar

- VS Code ile proje dosyalarını düzenliyorum. Git ile değişiklikleri
  kaydediyor, GitHub ile depoya gönderiyorum.
- Node.js, npm ve Vite ile JavaScript uygulamasını bilgisayarımda
  çalıştırıyorum. Node.js ve npm kurulumunu `node --version` ve
  `npm.cmd --version` komutlarıyla kontrol ettim.
- ethers v6 kütüphanesini kurtarma kelimelerini, seed'i ve Ethereum
  hesabını türetmek için kullanıyorum.
- MetaMask'i eğitim cüzdanını içe aktarıp Ethereum adresini karşılaştırmak
  için kullandım. Remix IDE'yi sonraki akıllı sözleşme görevleri için açtım.

## Eğitim cüzdanı uygulamasını çalıştırma

Deponun ana klasöründe PowerShell açın ve şu komutları sırasıyla çalıştırın:

```powershell
cd .\cuzdan-olusturucu
npm.cmd ci
npx.cmd vite
```

Terminalde `Local:` yanında verilen adresi tarayıcıda açın.
Ardından “Yeni eğitim cüzdanı oluştur” düğmesine basın.

## İP-12 · Cüzdan nasıl oluşturuluyor?

1. **Entropi:** `crypto.getRandomValues(entropi)` ile tarayıcıda 16 bayt
   (128 bit) güvenli rastgele veri üretiyorum. Bu veri, cüzdanı oluşturmak
   için kullanılan başlangıç noktasıdır.

2. **Kurtarma kelimeleri:** `Mnemonic.fromEntropy(entropi)` ile rastgele
   veriyi BIP39 biçimine dönüştürüyorum. Bu dönüşüm, veriye hata kontrol
   bilgisi (checksum) ekler ve sonucu İngilizce kelime listesinden seçilen
   12 kelimeyle ifade eder. Kelimeleri `mnemonic.phrase` üzerinden okuyorum.

3. **Seed:** `mnemonic.computeSeed()` ile 12 kurtarma kelimesinden 64 baytlık
   seed elde ediyorum. Bu uygulamada BIP39 ek parolası boş. Seed, hesap
   anahtarlarını türetmek için kullanılan başlangıç verisidir.

4. **Hesap ve özel anahtar:** `HDNodeWallet.fromSeed(seed)` ile türetmenin
   başlangıç noktasını oluşturuyorum. Ardından `derivePath(turetmeYolu)`
   çağrısına `m/44'/60'/0'/0/0` yolunu vererek ilk Ethereum hesabını
   türetiyorum. İşlemleri imzalamada kullanılan özel anahtarı
   `hesap.privateKey` üzerinden okuyorum.

5. **Açık anahtar:** ethers, açık anahtarı özel anahtardan hesaplıyor.
   `hesap.publicKey` ile bu değeri okuyorum. Açık anahtar, özel anahtar
   paylaşılmadan dijital imzaların doğrulanmasını sağlar.

6. **Ethereum adresi:** ethers, Ethereum adresini açık anahtardan türetiyor.
   `hesap.address` ile bu adresi okuyorum. Bu adresi test varlığı almak
   veya hesabı bir blok gezgininde sorgulamak için kullanabilirim.

Uygulama, açık anahtarı ve Ethereum adresini doğrudan gösterir. Entropi,
kurtarma kelimeleri, seed ve özel anahtar yalnızca yerel sayfada,
“Gizli değerleri göster” bölümü açıldığında görünür. Bu değerleri
depoya veya ekran görüntülerine eklemiyorum.

## İP-13 · MetaMask karşılaştırması ve checksum deneyi

Uygulamada oluşturduğum eğitim cüzdanını 12 kurtarma kelimesiyle MetaMask'e
aktardım. Uygulamanın gösterdiği Ethereum adresi ile MetaMask'teki
Account 1 adresinin tamamını karşılaştırdım ve eşleştiklerini doğruladım.
Adres eşleşmesinin ekran görüntüsünü araştırma notlarıma ekledim.

Checksum deneyinde 12 kelimelik bir test dizisinin kopyasını aldım ve ilk
kelimeyi BIP39 listesindeki başka bir kelimeyle değiştirdim.
`Mnemonic.isValidMnemonic()` ile kontrol ettiğimde uygulama “Ret” sonucu
verdi. Yeni kelime listede olsa da değiştirilmiş dizi checksum kontrolünden
geçmedi. Başka bir kelime değişikliği geçerli bir dizi oluşturabilir.
Checksum kontrolünden geçmek, dizinin güvenli rastgelelikle üretildiğini
tek başına göstermez.

Sonraki görevlerde MetaMask'te adresini doğruladığım eğitim hesabını
kullanacağım.
## İP-18 · Takım sözleşmesinin kaynak kodu

`takim-sozlesmesi/QuantumKayit.sol`, Quantum Team’in Sepolia’da
yayımladığı MIT lisanslı sözleşmenin kaynak kodudur. Bu kopyayı
yayımlama ve doğrulama deneyi için kullanıyorum.

[Orijinal kaynak kod — Sepolia Etherscan](https://sepolia.etherscan.io/address/0x81Dd700C459BF2806A1B5F2a349c89f0106A9036#code)

## İP-19
Remix’te sözleşme fonksiyonunu Deploy & Run panelinden, Etherscan’de ise Write Contract bölümünden çağırdım. İki arayüz de sözleşmenin adresini ve ABI’sini kullanarak işlem isteğini hazırlıyor. İşlemi MetaMask’te aynı eğitim hesabıyla imzaladım ve işlem Sepolia ağına gönderildi. Hangi sözleşmenin çalışacağını işlemdeki hedef adres belirliyor.

## İP-23 · quantumania Sepolia dağıtımı

- Ağ: Ethereum Sepolia
- Sözleşme: EtkinlikKayitV3
- Sözleşme adresi: 0x747B348033026C40236b62da31485bF0b31e2e42
- Dağıtım işlem hash’i: 0xdec9a73b213dd367a92ef1f07240002cdf201368750f68b7789b789f99d6d168
- Solidity derleyicisi: 0.8.20+commit.a1b79de6
- EVM hedefi: shanghai
- Optimizer: Kapalı
- ABI dosyası: `etkinlik-kayit/EtkinlikKayitV3.abi.json`


## İP-24 · Quantumania web arayüzü

Quantumania, MetaMask ile Sepolia’daki EtkinlikKayitV3 sözleşmesine bağlanıyor. Sözleşme adresi ve ağ kimliği `etkinlik-kayit/web/config.js` dosyasında, ABI ise `etkinlik-kayit/EtkinlikKayitV3.abi.json` dosyasında.

Eğitim cüzdanı oluşturucuyla ürettiğim ve İP-13’te MetaMask’te doğruladığım hesabı Quantumania’da da kullanıyorum. Arayüz MetaMask’ten hesabın açık adresini okuyor ve işlemleri MetaMask imzalıyor. İki uygulama arasında kurtarma kelimesi, seed veya özel anahtar aktarılmıyor.

### Quantumania’yı çalıştırma

Proje kökünde PowerShell açıp şu komutları çalıştırın:

    cd .\etkinlik-kayit
    npm.cmd ci
    npm.cmd run dev

Terminalde `Local:` yanında verilen adresi açın.