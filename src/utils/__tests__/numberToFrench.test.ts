import {
  numberToFrench,
  numberToFrenchCurrency,
  formatFrenchCurrency,
  convertTens,
  convertHundreds
} from '../numberToFrench';

describe('numberToFrench', () => {
  describe('convertTens', () => {
    test('converts numbers 0-19', () => {
      expect(convertTens(0)).toBe('');
      expect(convertTens(1)).toBe('un');
      expect(convertTens(10)).toBe('dix');
      expect(convertTens(15)).toBe('quinze');
      expect(convertTens(19)).toBe('dix-neuf');
    });

    test('converts tens 20-69', () => {
      expect(convertTens(20)).toBe('vingt');
      expect(convertTens(21)).toBe('vingt et un');
      expect(convertTens(22)).toBe('vingt-deux');
      expect(convertTens(30)).toBe('trente');
      expect(convertTens(31)).toBe('trente et un');
      expect(convertTens(45)).toBe('quarante-cinq');
      expect(convertTens(69)).toBe('soixante-neuf');
    });

    test('converts tens 70-79 (soixante-dix)', () => {
      expect(convertTens(70)).toBe('soixante-dix');
      expect(convertTens(71)).toBe('soixante-onze');
      expect(convertTens(79)).toBe('soixante-dix-neuf');
    });

    test('converts tens 80-89 (quatre-vingt)', () => {
      expect(convertTens(80)).toBe('quatre-vingts');
      expect(convertTens(81)).toBe('quatre-vingt-un');
      expect(convertTens(89)).toBe('quatre-vingt-neuf');
    });

    test('converts tens 90-99 (quatre-vingt-dix)', () => {
      expect(convertTens(90)).toBe('quatre-vingt-dix');
      expect(convertTens(91)).toBe('quatre-vingt-onze');
      expect(convertTens(99)).toBe('quatre-vingt-dix-neuf');
    });
  });

  describe('convertHundreds', () => {
    test('converts numbers 0-99', () => {
      expect(convertHundreds(0)).toBe('');
      expect(convertHundreds(1)).toBe('un');
      expect(convertHundreds(21)).toBe('vingt et un');
      expect(convertHundreds(99)).toBe('quatre-vingt-dix-neuf');
    });

    test('converts exact hundreds', () => {
      expect(convertHundreds(100)).toBe('cent');
      expect(convertHundreds(200)).toBe('deux cents');
      expect(convertHundreds(300)).toBe('trois cents');
      expect(convertHundreds(900)).toBe('neuf cents');
    });

    test('converts hundreds with remainder', () => {
      expect(convertHundreds(101)).toBe('cent un');
      expect(convertHundreds(121)).toBe('cent vingt et un');
      expect(convertHundreds(250)).toBe('deux cent cinquante');
      expect(convertHundreds(999)).toBe('neuf cent quatre-vingt-dix-neuf');
    });
  });

  describe('numberToFrench', () => {
    test('converts basic numbers', () => {
      expect(numberToFrench(0)).toBe('zéro');
      expect(numberToFrench(1)).toBe('un');
      expect(numberToFrench(10)).toBe('dix');
      expect(numberToFrench(100)).toBe('cent');
    });

    test('converts story examples', () => {
      expect(numberToFrench(12000)).toBe('douze mille');
      expect(numberToFrench(25750)).toBe('vingt-cinq mille sept cent cinquante');
      expect(numberToFrench(1000000)).toBe('un million');
    });

    test('converts contribution minimums', () => {
      expect(numberToFrench(250)).toBe('deux cent cinquante');
      expect(numberToFrench(750)).toBe('sept cent cinquante');
      expect(numberToFrench(1500)).toBe('mille cinq cents');
      expect(numberToFrench(3000)).toBe('trois mille');
    });

    test('converts thousands', () => {
      expect(numberToFrench(1000)).toBe('mille');
      expect(numberToFrench(2000)).toBe('deux mille');
      expect(numberToFrench(1001)).toBe('mille un');
      expect(numberToFrench(1100)).toBe('mille cent');
      expect(numberToFrench(1234)).toBe('mille deux cent trente-quatre');
    });

    test('converts millions', () => {
      expect(numberToFrench(1000000)).toBe('un million');
      expect(numberToFrench(2000000)).toBe('deux millions');
      expect(numberToFrench(1000001)).toBe('un million un');
      expect(numberToFrench(1234567)).toBe('un million deux cent trente-quatre mille cinq cent soixante-sept');
    });

    test('converts complex numbers', () => {
      expect(numberToFrench(123456789)).toBe('cent vingt-trois millions quatre cent cinquante-six mille sept cent quatre-vingt-neuf');
      expect(numberToFrench(999999999)).toBe('neuf cent quatre-vingt-dix-neuf millions neuf cent quatre-vingt-dix-neuf mille neuf cent quatre-vingt-dix-neuf');
    });

    test('handles edge cases', () => {
      expect(() => numberToFrench(-1)).toThrow('Negative numbers are not supported');
      expect(() => numberToFrench(1000000000)).toThrow('Numbers greater than 999,999,999 are not supported');
    });
  });

  describe('numberToFrenchCurrency', () => {
    test('converts with default currency', () => {
      expect(numberToFrenchCurrency(100)).toBe('Cent dirhams');
      expect(numberToFrenchCurrency(12000)).toBe('Douze mille dirhams');
    });

    test('converts with custom currency', () => {
      expect(numberToFrenchCurrency(100, 'euros')).toBe('Cent euros');
      expect(numberToFrenchCurrency(1000, 'dollars')).toBe('Mille dollars');
    });

    test('capitalizes first letter', () => {
      expect(numberToFrenchCurrency(21)).toBe('Vingt et un dirhams');
      expect(numberToFrenchCurrency(80)).toBe('Quatre-vingts dirhams');
    });
  });

  describe('formatFrenchCurrency', () => {
    test('formats for UI display', () => {
      expect(formatFrenchCurrency(100)).toBe('Cent Dirhams');
      expect(formatFrenchCurrency(250)).toBe('Deux cent cinquante Dirhams');
      expect(formatFrenchCurrency(12000)).toBe('Douze mille Dirhams');
    });
  });
});