import { HDNodeWallet, Mnemonic } from "ethers";
const olusturDugmesi = document.getElementById("cuzdan-olustur");
const sonuclar = document.getElementById("sonuclar");

olusturDugmesi.addEventListener("click", () => {
  const entropi = new Uint8Array(16);
  crypto.getRandomValues(entropi);
  const mnemonic = Mnemonic.fromEntropy(entropi);
const kelimeSayisi = mnemonic.phrase.split(" ").length;
const seed = mnemonic.computeSeed();
const seedBaytSayisi = (seed.length - 2) / 2;
const turetmeYolu = "m/44'/60'/0'/0/0";
const hesap = HDNodeWallet.fromSeed(seed).derivePath(turetmeYolu);
const acikBilgiler = document.createElement("pre");
acikBilgiler.textContent = [
  `Entropi boyutu: ${entropi.byteLength} bayt`,
  `Kurtarma kelimesi sayısı: ${kelimeSayisi}`,
  `Seed boyutu: ${seedBaytSayisi} bayt`,
  `Türetme yolu: ${turetmeYolu}`,
  `Açık anahtar: ${hesap.publicKey}`,
  `Ethereum adresi: ${hesap.address}`,
].join("\n");

const gizliBolum = document.createElement("details");
const baslik = document.createElement("summary");
baslik.textContent = "Gizli değerleri göster";

const gizliBilgiler = document.createElement("pre");
gizliBilgiler.textContent = [
  `Entropi: ${mnemonic.entropy}`,
  `Kurtarma kelimeleri: ${mnemonic.phrase}`,
  `Seed: ${seed}`,
  `Özel anahtar: ${hesap.privateKey}`,
].join("\n");

gizliBolum.append(baslik, gizliBilgiler);
const checksumDugmesi = document.createElement("button");
checksumDugmesi.type = "button";
checksumDugmesi.textContent = "Checksum deneyi yap";

const checksumSonucu = document.createElement("p");

checksumDugmesi.addEventListener("click", () => {
  const kelimeKopyasi = mnemonic.phrase.split(" ");
  kelimeKopyasi[0] = kelimeKopyasi[0] === "abandon" ? "ability" : "abandon";

  const gecerli = Mnemonic.isValidMnemonic(kelimeKopyasi.join(" "));
  checksumSonucu.textContent = `Tek kelime değişikliği: ${gecerli ? "Kabul" : "Ret"}`;
});

sonuclar.replaceChildren(acikBilgiler, gizliBolum, checksumDugmesi, checksumSonucu);
});