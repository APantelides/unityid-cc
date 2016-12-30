var axios = require('axios');
var bigInt = require('big-integer');


class RSA {
  constructor () {
    var randomNumHTPPrequest = (min, max) => { // Generate random number using random.com
      var prime = axios.get('https://www.random.org/integers/', {
        params: {
          num: 1,
          min: min,
          max: max,
          base: 10,
          col: 1,
          format: 'plain',
          rnd: 'new'
        }
      })
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(err);
          throw err;
        });
      return prime;
    };

    var randomPrime1 = (min, max) => {  //generate pseudo random number using Math.random();
      var p = Math.floor(Math.random() * ((max - 1) - min + 1)) + min;
      //var p = randomNumHTPPrequest(min, max); //still trying to get this to work!
      if (bigInt(p).isPrime() === true) {
        return p;
      } else {
        return randomPrime1(min, max);   
      } 
    };

    var modMult = (a, n) => {
      var t = 0;
      var nt = 1;
      var r = n;
      if (n < 0) {
        n = -n;
      }
      if (a < 0) {
        a = n - (-a % n);
      }
      var nr = a % n;
      while (nr !== 0) {
        var quot = (r / nr) | 0;
        var tmp = nt;
        nt = t - quot * nt;
        t = tmp;
        tmp = nr;
        nr = r - quot * nr;
        r = tmp;
      }

      if (r > 1) { return -1; }

      if (t < 0) { t += n; }

      return t;
    };

    var p = randomPrime1(1, 255);
    var q = randomPrime1(1, 255);
    var t = (p - 1) * (q - 1);
    this.publicKey1 = p * q; //public key1
    this.publicKey2 = randomPrime1(1, t); //public key2
    this.privateKey = modMult(this.publicKey2, t); //private key
  }

  encrypt(message, publicKey1, publicKey2) {
    return bigInt(message).pow(publicKey2).mod(publicKey1);
  }

  decrypt(encodedMsg, privateKey, publicKey1) {
    return bigInt(encodedMsg).pow(privateKey).mod(publicKey1);
  }
}

var crypto = new RSA();
console.log(crypto);