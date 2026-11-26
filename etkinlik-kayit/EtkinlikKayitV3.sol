// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract EtkinlikKayitV3 {
    string public etkinlikAdi = "quantumania";
    uint256 public constant kapasite = 3;
    uint256 public kayitSayisi;

    mapping(address => string) public takmaAdlar;
    mapping(address => bool) public girisYapti;

    address public immutable gorevli;

    event KayitOlusturuldu(address indexed katilimci, string takmaAd);
    event GirisOnaylandi(address indexed katilimci);

    constructor() {
        gorevli = msg.sender;
    }

    function kayitOl(string calldata takmaAd) external {
        require(bytes(takmaAd).length > 0, "Takma ad bos olamaz");
        require(bytes(takmaAdlar[msg.sender]).length == 0, "Bu adres zaten kayitli");
        require(kayitSayisi < kapasite, "Kapasite dolu");

        takmaAdlar[msg.sender] = takmaAd;
        kayitSayisi += 1;

        emit KayitOlusturuldu(msg.sender, takmaAd);
    }

    function girisiOnayla(address katilimci) external {
        require(msg.sender == gorevli, "Sadece gorevli giris onaylayabilir");
        require(bytes(takmaAdlar[katilimci]).length > 0, "Katilimci kayitli degil");
        require(!girisYapti[katilimci], "Katilimci zaten giris yapti");

        girisYapti[katilimci] = true;

        emit GirisOnaylandi(katilimci);
    }
}