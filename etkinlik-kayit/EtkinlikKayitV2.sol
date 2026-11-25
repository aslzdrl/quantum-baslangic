// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract EtkinlikKayitV2 {
    string public etkinlikAdi = "quantumania";
    mapping(address => string) public takmaAdlar;
uint256 public constant kapasite = 3;
uint256 public kayitSayisi;
    function kayitOl(string calldata takmaAd) external {
        require(bytes(takmaAd).length > 0, "Takma ad bos olamaz");
        require(bytes(takmaAdlar[msg.sender]).length == 0, "Bu adres zaten kayitli");
        require(kayitSayisi < kapasite, "Kapasite dolu");
        takmaAdlar[msg.sender] = takmaAd;
        kayitSayisi += 1;
    }
}