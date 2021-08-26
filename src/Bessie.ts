
export class Bessie {
  protected shy: boolean = false;
  public setShy(shyIn: boolean) {
    this.shy = shyIn;
  }
  public bark(): string {
    let sound: string;
    if (this.shy) {
      sound = "Yip";
    }
    else {
      sound = "WOOF!";
    }
    return sound;
  }
  // return this.shy ? 'Yip' : 'Woof!'
}