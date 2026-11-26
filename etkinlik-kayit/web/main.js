import { BrowserProvider, Contract, getAddress, isAddress } from 'ethers';
import {
  contractAddress,
  contractAbi,
  sepoliaChainId,
  explorer,
} from './config.js';

const byId = (id) => document.getElementById(id);
const wallet = window.ethereum;
const provider = wallet
  ? new BrowserProvider(wallet, 'any', { cacheTimeout: -1 })
  : null;

const registrationForm = byId('registration');
const registrationNotice = byId('registration-notice')
  ?? document.createElement('p');

registrationNotice.id = 'registration-notice';
registrationNotice.classList.add('notice');
registrationNotice.setAttribute('role', 'status');
registrationNotice.hidden = true;
registrationForm.before(registrationNotice);

let refreshId = 0;
let registrationAccount = null;
let officerAccount = null;
let sending = false;
let checkingReceipt = false;
let pendingTransaction = null;

function showWalletNotice(message) {
  const notice = byId('wallet-notice');
  notice.textContent = message;
  notice.hidden = !message;
}

function showRegistrationNotice(message) {
  registrationNotice.textContent = message;
  registrationNotice.hidden = !message;
}

function showStatus(message, tone = '', hash = '') {
  const status = byId('status');
  const link = byId('explorer');

  status.textContent = message;
  status.parentElement.dataset.tone = tone;
  link.hidden = !hash;

  if (hash) {
    link.href = `${explorer}/tx/${hash}`;
  } else {
    link.removeAttribute('href');
  }
}

function updateButtons() {
  const blocked = sending || checkingReceipt || Boolean(pendingTransaction);
  byId('register').disabled = blocked || !registrationAccount;
  byId('approve').disabled = blocked || !officerAccount;
}

function wasRejected(error) {
  return error?.code === 4001 || error?.code === 'ACTION_REJECTED';
}

function transactionError(error, fallback) {
  if (wasRejected(error)) return 'MetaMask onayını reddettin.';

  const details = [
    error?.reason,
    error?.shortMessage,
    error?.message,
    error?.info?.error?.message,
  ].join(' ');

  const reasons = [
    ['Bu adres zaten kayitli', 'Bu hesap zaten kayıtlı.'],
    ['Kapasite dolu', 'Etkinliğin kapasitesi dolu.'],
    ['Takma ad bos olamaz', 'Takma ad boş olamaz.'],
    ['Sadece gorevli', 'Giriş onayını yalnızca görevli verebilir.'],
    ['Katilimci kayitli degil', 'Bu katılımcı kayıtlı değil.'],
    ['Katilimci zaten giris yapti', 'Bu katılımcının girişi daha önce onaylanmış.'],
  ];

  return reasons.find(([reason]) => details.includes(reason))?.[1] ?? fallback;
}

async function refreshWallet() {
  const currentRefresh = ++refreshId;
  const connectButton = byId('connect');

  registrationAccount = null;
  officerAccount = null;
  updateButtons();

  connectButton.textContent = 'Cüzdan bağla';
  connectButton.removeAttribute('title');
  byId('network').textContent = 'Sepolia';
  byId('capacity').textContent = '— / — kayıt';
  byId('nickname-status').textContent = '—';
  byId('entry-status').textContent = '—';
  byId('role').textContent = 'Görevli hesabını MetaMask ile bağlayabilirsin.';
  byId('welcome').textContent = 'Hoş geldin!';
  showWalletNotice('');
  showRegistrationNotice('');

  if (!provider) return;

  try {
    const [accounts, chainId] = await Promise.all([
      wallet.request({ method: 'eth_accounts' }),
      wallet.request({ method: 'eth_chainId' }),
    ]);

    if (currentRefresh !== refreshId) return;

    const account = accounts[0] ? getAddress(accounts[0]) : null;

    if (account) {
      connectButton.textContent = `${account.slice(0, 6)}…${account.slice(-5)}`;
      connectButton.title = account;
    }

    if (BigInt(chainId) !== sepoliaChainId) {
      byId('network').textContent = 'Yanlış ağ';
      showWalletNotice('Devam etmek için MetaMask’te Sepolia ağına geç.');
      return;
    }

    const contract = new Contract(contractAddress, contractAbi, provider);
    const [eventName, capacity, count, officer, nickname, checkedIn] =
      await Promise.all([
        contract.etkinlikAdi(),
        contract.kapasite(),
        contract.kayitSayisi(),
        contract.gorevli(),
        account ? contract.takmaAdlar(account) : '',
        account ? contract.girisYapti(account) : false,
      ]);

    if (currentRefresh !== refreshId) return;

    byId('event-name').textContent = eventName;
    byId('capacity').textContent = `${count} / ${capacity} kayıt`;

    if (account) {
      officerAccount = account === getAddress(officer) ? account : null;
      byId('nickname-status').textContent = nickname || 'Kayıt yok';
      byId('entry-status').textContent = checkedIn
        ? 'Onaylandı'
        : nickname
          ? 'Onay bekliyor'
          : 'Kayıt bekliyor';

      byId('role').textContent = officerAccount
        ? 'Görevli hesabı bağlı.'
        : 'Giriş onayını yalnızca görevli verebilir.';

      if (nickname) {
        byId('welcome').textContent = `Hoş geldin, ${nickname}!`;
        showRegistrationNotice('Bu hesap zaten kayıtlı.');
      } else if (count >= capacity) {
        showRegistrationNotice('Etkinliğin kapasitesi dolu.');
      } else {
        registrationAccount = account;
      }
    }
  } catch (error) {
    if (currentRefresh === refreshId) {
      console.error('Quantumania sözleşme sorgusu', error);
      showWalletNotice(
        'Sözleşme bilgileri okunamadı. Sepolia bağlantısını kontrol edip bilgileri yenile.'
      );
    }
  } finally {
    if (currentRefresh === refreshId) updateButtons();
  }
}

byId('connect').addEventListener('click', async () => {
  if (!wallet) {
    showWalletNotice('Bu sayfayı MetaMask’in kurulu olduğu tarayıcıda aç.');
    return;
  }

  const button = byId('connect');
  button.disabled = true;

  try {
    await wallet.request({ method: 'eth_requestAccounts' });
    await refreshWallet();
  } catch (error) {
    console.error('MetaMask hesap erişimi', error);

    if (error?.code === -32002) {
      showWalletNotice('MetaMask’te bekleyen bağlantı isteğini aç.');
    } else if (wasRejected(error)) {
      showWalletNotice('Cüzdan bağlantısını reddettin.');
    } else {
      showWalletNotice('MetaMask bağlantısı kurulamadı. Cüzdanı açıp tekrar dene.');
    }
  } finally {
    button.disabled = false;
  }
});

function showUnconfirmed(hash) {
  showStatus(
    'İşlemin sonucu henüz doğrulanamadı. Bilgileri yenile veya Etherscan’den takip et.',
    'error',
    hash
  );
}

function finishTransaction(receipt, transaction) {
  if (receipt?.status !== 0 && receipt?.status !== 1) {
    showUnconfirmed(transaction.hash);
    return;
  }

  pendingTransaction = null;

  if (receipt.status === 1) {
    showStatus(transaction.successMessage, 'success', transaction.hash);
    byId(transaction.inputId).value = '';
  } else {
    showStatus(transaction.failureMessage, 'error', transaction.hash);
  }
}

async function sendTransaction({
  account,
  inputId,
  method,
  argument,
  successMessage,
  failureMessage,
  fallbackMessage,
}) {
  if (!account || sending || checkingReceipt || pendingTransaction) return;

  sending = true;
  updateButtons();

  try {
    const [accounts, chainId] = await Promise.all([
      wallet.request({ method: 'eth_accounts' }),
      wallet.request({ method: 'eth_chainId' }),
    ]);

    if (BigInt(chainId) !== sepoliaChainId) {
      showStatus('İşlem yapmak için MetaMask’te Sepolia ağına geç.', 'error');
      return;
    }

    if (!accounts[0] || getAddress(accounts[0]) !== account) {
      showStatus('MetaMask hesabı değişti. Bağlı hesabı kontrol et.', 'error');
      return;
    }

    const signer = await provider.getSigner(account);
    const contract = new Contract(contractAddress, contractAbi, signer);
    const request = await contract[method].populateTransaction(argument);

    showStatus('MetaMask onayı bekleniyor…');

    const hash = await signer.sendUncheckedTransaction({
      ...request,
      chainId: sepoliaChainId,
    });

    const transaction = { hash, inputId, successMessage, failureMessage };
    pendingTransaction = transaction;
    showStatus('İşlem gönderildi. Sepolia sonucu bekleniyor…', '', hash);

    const receipt = await provider.getTransactionReceipt(hash)
      ?? await provider.waitForTransaction(hash, 1, 60_000);

    finishTransaction(receipt, transaction);
  } catch (error) {
    console.error('Quantumania işlemi', error);

    if (pendingTransaction) {
      showUnconfirmed(pendingTransaction.hash);
    } else {
      showStatus(transactionError(error, fallbackMessage), 'error');
    }
  } finally {
    try {
      await refreshWallet();
    } finally {
      sending = false;
      updateButtons();
    }
  }
}

registrationForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (byId('register').disabled) return;

  const nickname = byId('nickname').value.trim();

  if (!nickname) {
    showStatus('Takma ad boş olamaz.', 'error');
    return;
  }

  void sendTransaction({
    account: registrationAccount,
    inputId: 'nickname',
    method: 'kayitOl',
    argument: nickname,
    successMessage: 'Kayıt tamamlandı.',
    failureMessage: 'Kayıt işlemi zincirde başarısız oldu.',
    fallbackMessage: 'Kayıt işlemi gönderilemedi.',
  });
});

byId('checkin').addEventListener('submit', (event) => {
  event.preventDefault();
  if (byId('approve').disabled) return;

  const participant = byId('participant').value.trim();

  if (!isAddress(participant)) {
    showStatus('Katılımcının tam Ethereum adresini gir.', 'error');
    return;
  }

  void sendTransaction({
    account: officerAccount,
    inputId: 'participant',
    method: 'girisiOnayla',
    argument: getAddress(participant),
    successMessage: 'Giriş onaylandı.',
    failureMessage: 'Giriş onayı zincirde başarısız oldu.',
    fallbackMessage: 'Giriş onayı gönderilemedi.',
  });
});

byId('refresh').addEventListener('click', async () => {
  if (checkingReceipt) return;

  const transaction = pendingTransaction;

  if (!transaction || sending) {
    await refreshWallet();
    return;
  }

  checkingReceipt = true;
  updateButtons();

  try {
    const chainId = await wallet.request({ method: 'eth_chainId' });

    if (BigInt(chainId) === sepoliaChainId) {
      const receipt = await provider.getTransactionReceipt(transaction.hash);
      finishTransaction(receipt, transaction);
    }
  } catch (error) {
    console.error('Quantumania makbuz sorgusu', error);
    showUnconfirmed(transaction.hash);
  } finally {
    try {
      await refreshWallet();
    } finally {
      checkingReceipt = false;
      updateButtons();
    }
  }
});

wallet?.on?.('accountsChanged', () => {
  if (!sending && !checkingReceipt && !pendingTransaction) {
    showStatus('');
  }

  void refreshWallet();
});
wallet?.on?.('chainChanged', refreshWallet);
wallet?.on?.('disconnect', refreshWallet);

document.querySelectorAll('.links').forEach((chain) => {
  chain.addEventListener('click', () => {
    chain.classList.remove('swing');
    void chain.offsetWidth;
    chain.classList.add('swing');
  });
});

const flowerButtons = document.querySelectorAll('.flowers button');

function showFlowerTip(activeButton) {
  flowerButtons.forEach((flower) => {
    const isOpen = flower === activeButton;
    const tip = byId(flower.getAttribute('aria-controls'));

    flower.setAttribute('aria-expanded', String(isOpen));
    tip.hidden = !isOpen;
  });
}

flowerButtons.forEach((button) => {
  button.addEventListener('pointerenter', (event) => {
    if (event.pointerType === 'mouse') showFlowerTip(button);
  });

  button.addEventListener('pointerleave', (event) => {
    if (event.pointerType === 'mouse') showFlowerTip(null);
  });

  button.addEventListener('click', () => {
    const isOpen = button.getAttribute('aria-expanded') === 'true';
    showFlowerTip(isOpen ? null : button);
  });
});

void refreshWallet();