export class RutHelper {
    static validate(rut: string): boolean {
        if (!/^[0-9]+[-|‐][0-9kK]{1}$/.test(rut)) return false;
        const [num, dv] = rut.replace(/\./g, '').split('-');
        let T = parseInt(num);
        let M = 0,
            S = 1;
        for (; T; T = Math.floor(T / 10)) {
            S = (S + (T % 10) * (9 - (M++ % 6))) % 11;
        }
        const expectedDv = S ? (S - 1).toString() : 'k';
        return expectedDv === dv.toLowerCase();
    }

    static format(rut: string): string {
        return rut.replace(/\./g, '').replace(/-/g, '').toLowerCase();
    }
}
