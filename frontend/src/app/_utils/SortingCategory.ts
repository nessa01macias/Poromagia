export class SortingCategory {
  static readonly PRICE = new SortingCategory('Price', true, true, '€');
  static readonly STOCK = new SortingCategory('Stock', false, true, 'pieces');
  static readonly WANTED = new SortingCategory('Wanted', false, false, '');

  // private to disallow creating other sorting category instances
  private constructor(public readonly name: string, public selected: boolean,
                      public readonly configurable: boolean, public readonly unit: string) {
  }

  toString(): string {
    return this.name;
  }
}
