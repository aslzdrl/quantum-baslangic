// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract EtkinlikKayit {
    string public etkinlikAdi = "quantumania";
    mapping(address => string) public takmaAdlar;

    function kayitOl(string calldata takmaAd) external {
        takmaAdlar[msg.sender] = takmaAd;
    }
}