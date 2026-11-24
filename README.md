# Quantum Başlangıç

Bu depo, Quantum Team Blokzincir Oryantasyon İş Paketi kapsamında
hazırladığım araştırma notlarını ve geliştireceğim uygulamaları içeriyor.

Bu çalışmada bir Ethereum işleminin nasıl gönderildiğini ve sonucunun
nasıl doğrulandığını öğrenmek istiyorum. Ayrıca eğitim amaçlı bir cüzdan
oluşturmayı, Solidity ile etkinlik kayıt sözleşmesi yazmayı ve bu
sözleşmeyi MetaMask bağlantılı bir web arayüzünden kullanmayı hedefliyorum.
Eğitim cüzdanı uygulamasında JavaScript kullanıyorum. Node.js ve npm,
uygulamanın kütüphanelerini kurmak ve uygulamayı yerelde çalıştırmak
için kullanılacak.
## İP-12 · Eğitim cüzdanı oluşturucu

Uygulamayı çalıştırmak için depo ana klasöründe PowerShell açın:

```powershell
cd .\cuzdan-olusturucu
npm.cmd ci
npx.cmd vite
```

Terminalde `Local:` yanında verilen adresi tarayıcıda açın ve
“Yeni eğitim cüzdanı oluştur” düğmesine basın.

- `crypto.getRandomValues` ile 16 bayt (128 bit) güvenli rastgele veri üretiyorum.
- `Mnemonic.fromEntropy` bu entropiyi 12 İngilizce BIP39 kelimesine dönüştürüyor.
- `mnemonic.computeSeed()` bu kelimelerden 64 baytlık seed üretiyor. BIP39 ek parolası boş.
- `HDNodeWallet.fromSeed(seed).derivePath(turetmeYolu)` ile
  `m/44'/60'/0'/0/0` yolundaki Ethereum hesabını türetiyorum.
- Türetilen hesabın özel anahtarını, açık anahtarını ve Ethereum adresini
  sırasıyla `hesap.privateKey`, `hesap.publicKey` ve `hesap.address` ile okuyorum.

Gizli değerler yalnızca yerel sayfada, kapalı başlayan bir bölümde gösterilir.