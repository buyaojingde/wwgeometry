describe('Array', () => {
  it('find', () => {
    const face = [
      { X: 43400, Y: 4900, Z: 16460 },
      { X: 43400, Y: 4000, Z: 16460 },
      { X: 43400, Y: 4000, Z: 19760 },
      { X: 43400, Y: 4900, Z: 19760 },
    ];
    const vertex = { X: 43400, Y: 4900, Z: 16460 };
    const find = face.find(
      (item: any) =>
        item.X === vertex.X && item.Y === vertex.Y && item.Z === vertex.Z
    );
    console.log(find);
    expect(!!find).toBe(true);
  });
});
