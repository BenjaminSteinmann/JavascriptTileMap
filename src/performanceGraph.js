export class PerformanceGraph {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.frameTimes = [];
    this.renderTimes = [];
    this.history = 500;
    this.intervalWidth = (width - 20) / this.history;
  }

  /**
   * @param {CanvasRenderingContext2D} ctx - the canvas context to render on
   */
  render(ctx) {
    let rX = this.x;
    let rY = this.y;
    if (this.rX === -1) rX = ctx.canvas.width - this.width;
    if (this.rY === -1) rY = ctx.canvas.height - this.height;
    ctx.clearRect(rX, rY, this.width, this.height);
    ctx.fillStyle = "gray";
    ctx.fillRect(rX, rY, this.width, this.height);
    //ctx.lineWidth = 2;
    let maxFrame = Math.max(...this.frameTimes);
    ctx.font = "10px sans-serif";
    ctx.fillStyle = "red";
    ctx.textAlign = "left";
    ctx.fillText((maxFrame * 1000).toFixed(1) + "ms", rX + 2, rY + 10);
    ctx.fillText(
      ((this.frameTimes.reduce((a, b) => a + b, 0) * 1000) / (this.frameTimes.length || 1)).toFixed(2) + "ms avg",
      rX + 2,
      rY + this.height - 2
    );
    ctx.strokeStyle = "red";
    ctx.beginPath();
    ctx.moveTo(rX + 10, rY + this.height - 10 - (this.frameTimes[0] / maxFrame) * (this.height - 20));
    for (let i = 1; i < this.frameTimes.length; i++) {
      const nx = rX + 10 + i * this.intervalWidth;
      const ny = rY + this.height - 10 - (this.frameTimes[i] / maxFrame) * (this.height - 20); // Scale down for better visualization
      ctx.lineTo(nx, ny);
    }
    ctx.stroke();
    let maxRender = Math.max(...this.renderTimes);
    ctx.fillStyle = "yellow";
    ctx.textAlign = "right";
    ctx.fillText(maxRender.toFixed(1) + "ms", rX + this.width - 2, rY + 10);
    ctx.fillText(
      (
        this.renderTimes.reduce((a, b) => {
          return b !== 0 ? a + b : a;
        }, 0) / (this.renderTimes.length || 1)
      ).toFixed(2) + "ms avg",
      rX + this.width - 2,
      rY + this.height - 2
    );
    ctx.strokeStyle = "yellow";
    ctx.beginPath();
    ctx.moveTo(rX + 10, rY + this.height - 10 - (this.renderTimes[0] / maxRender) * (this.height - 20));
    for (let i = 0; i < this.renderTimes.length; i++) {
      const nx = rX + 10 + i * this.intervalWidth;
      const ny = rY + this.height - 10 - (this.renderTimes[i] / maxRender) * (this.height - 20); // Scale down for better visualization
      ctx.lineTo(nx, ny);
    }
    ctx.stroke();
  }

  update(deltaT, renderT) {
    if (deltaT || deltaT === 0) this.frameTimes.push(deltaT);
    if (renderT || renderT === 0) this.renderTimes.push(renderT);
    if (this.frameTimes.length > this.history) this.frameTimes.shift();
    if (this.renderTimes.length > this.history) this.renderTimes.shift();
  }
}
export default PerformanceGraph;
