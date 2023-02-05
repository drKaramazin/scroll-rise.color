import { Motion, TimeFrame, Scene, Util } from "scroll-rise";

interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

interface LinearColorStop {
  lengthPercentage: number;
  color: RGBA;
}

interface LinearGradient {
  angle: number;
  stopList: LinearColorStop[];
}

export class BackgroundLinearGradientMotion extends Motion {

  name = 'BackgroundLinearGradientMotion';

  start: LinearGradient;
  end: LinearGradient;

  constructor(data: { start: LinearGradient, end: LinearGradient }) {
    super();

    this.start = data.start;
    this.end = data.end;

    if (this.start.stopList.length !== this.end.stopList.length) {
      throw new Error('Stop-list lengths of linear gradients are not equal in ' + this.name);
    }
  }

  makeRGBA(color: RGBA): string {
    return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
  }

  makeStopList(stopList: LinearColorStop[]): string {
    return stopList.map(stop => `${this.makeRGBA(stop.color)} ${stop.lengthPercentage}%`).join(', ');
  }

  makeBackgroundStyle(gradient: LinearGradient): string {
    return `linear-gradient(${gradient.angle}deg, ${this.makeStopList(gradient.stopList)})`;
  }

  make(
    scrollPos: number,
    frame: TimeFrame,
    element: HTMLElement,
    scene: Scene<any>,
  ) {
    if (element) {
      const d = scrollPos / frame.length();

      if (d < 0) {
        element.style.background = this.makeBackgroundStyle(this.start);
        return;
      }
      if (d > 1) {
        element.style.background = this.makeBackgroundStyle(this.end);
        return;
      }

      const calcValue = (start: number, end: number) => Util.castToInt(start + (end - start) * d);

      const stopList = this.start.stopList.map((item , index): LinearColorStop => {
        const r = calcValue(item.color.r, this.end.stopList[index].color.r);
        const g = calcValue(item.color.g, this.end.stopList[index].color.g);
        const b = calcValue(item.color.b, this.end.stopList[index].color.b);
        const a = calcValue(item.color.a, this.end.stopList[index].color.a);
        const lengthPercentage: number = calcValue(item.lengthPercentage, this.end.stopList[index].lengthPercentage);

        return {
          lengthPercentage,
          color: {
            r,
            g,
            b,
            a,
          }
        };
      });

      element.style.background = this.makeBackgroundStyle({
        stopList,
        angle: calcValue(this.start.angle, this.end.angle),
      });
    }
  }

}

export class SVGLinearGradientMotion extends Motion {

  name = 'SVGLinearGradientMotion';

  start: LinearGradient;
  end: LinearGradient;

  constructor(data: { start: LinearGradient, end: LinearGradient }) {
    super();

    this.start = data.start;
    this.end = data.end;

    if (this.start.stopList.length !== this.end.stopList.length) {
      throw new Error('Stop-list lengths of linear gradients are not equal in ' + this.name);
    }
  }

  defineElement(gradient: LinearGradient, container: HTMLElement) {
    container.setAttribute('gradientTransform', `rotate(${gradient.angle})`);
    container.innerHTML = '';
    for (let stop of gradient.stopList) {
      const stopElement = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
      stopElement.setAttribute('offset', `${stop.lengthPercentage}%`);
      stopElement.setAttribute('stop-color', `rgba(${stop.color.r}, ${stop.color.g}, ${stop.color.b}, ${stop.color.a})`);
      container.append(stopElement);
    }
  }

  make(
    scrollPos: number,
    frame: TimeFrame,
    element: HTMLElement,
    scene: Scene<any>,
  ) {
    if (element) {
      const d = scrollPos / frame.length();

      if (d < 0) {
        this.defineElement(this.start, element);
        return;
      }
      if (d > 1) {
        this.defineElement(this.end, element);
        return;
      }

      const calcValue = (start: number, end: number) => Util.castToInt(start + (end - start) * d);

      const stopList = this.start.stopList.map((item , index): LinearColorStop => {
        const r = calcValue(item.color.r, this.end.stopList[index].color.r);
        const g = calcValue(item.color.g, this.end.stopList[index].color.g);
        const b = calcValue(item.color.b, this.end.stopList[index].color.b);
        const a = calcValue(item.color.a, this.end.stopList[index].color.a);
        const lengthPercentage: number = calcValue(item.lengthPercentage, this.end.stopList[index].lengthPercentage);

        return {
          lengthPercentage,
          color: {
            r,
            g,
            b,
            a,
          }
        };
      });

      this.defineElement({
        stopList,
        angle: calcValue(this.start.angle, this.end.angle),
      }, element);
    }
  }

}

export class FillMotion extends Motion {

  name = 'FillMotion';

  start: RGBA;
  end: RGBA;

  constructor(data: { start: RGBA, end: RGBA }) {
    super();

    this.start = data.start;
    this.end = data.end;
  }

  calcRGBA(start: RGBA, end: RGBA, delta: number): RGBA {
    const calcValue = (start: number, end: number) => Util.castToInt(start + (end - start) * delta);

    const r = calcValue(start.r, end.r);
    const g = calcValue(start.g, end.g);
    const b = calcValue(start.b, end.b);
    const a = calcValue(start.a, end.a);

    return { r, g, b, a };
  }

  makeRGBA(color: RGBA): string {
    return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
  }

  make(
    scrollPos: number,
    frame: TimeFrame,
    element: HTMLElement,
    scene: Scene<any>,
  ) {
    if (element) {
      const d = scrollPos / frame.length();

      if (d < 0) {
        element.style.fill = this.makeRGBA(this.start);
        return;
      }
      if (d > 1) {
        element.style.fill = this.makeRGBA(this.end);
        return;
      }

      element.style.fill = this.makeRGBA(this.calcRGBA(this.start, this.end, d));
    }
  }

}