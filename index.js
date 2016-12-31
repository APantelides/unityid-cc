var axios = require('axios');
var bigInt = require('big-integer');


class RSA {
  constructor () {

    const cache = {};

    var randomPrime1 = (min, max) => {  //generate pseudo random number using Math.random();
      var p = Math.floor(Math.random() * ((max - 1) - min + 1)) + min;
      if (bigInt(p).isPrime() === true) {
        return p;
      } else {
        return randomPrime1(min, max);   
      } 
    };

    var randomPrime2 = (min, max, key, callback) => { // Generate random number using random.com
      axios.get('https://www.random.org/integers/', {
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
          var randomNumber = res.data;
          if (bigInt(randomNumber).isPrime()) {
            cache[key] = randomNumber;
            callback();
          } else {
            randomPrime2(min, max, key, callback);
          }
        })
        .catch((err) => {
          console.log(err);
          throw err;
        });
    };

    var setPublicKeys = () => {
      cache.t = (cache.p - 1) * (cache.q - 1);
      this.publicKey1 = cache.p * cache.q; //public key1
      randomPrime2(1, cache.t, 'publicKey2', setPrivateKey);
    };

    var setPrivateKey = () => {
      this.publicKey2 = cache.publicKey2;
      this.privateKey = modMult(this.publicKey2, cache.t);
      console.log(this);
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

    randomPrime2(1, 255, 'p', () => randomPrime2(1, 255, 'q', setPublicKeys));
  }

  encrypt(message, publicKey1, publicKey2) {
    return bigInt(message).pow(publicKey2).mod(publicKey1);
  }

  decrypt(encodedMsg, privateKey, publicKey1) {
    return bigInt(encodedMsg).pow(privateKey).mod(publicKey1);
  }
}



var crypto = new RSA();