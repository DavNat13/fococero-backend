export class RutHelper {
    /**
     * Limpia el RUT quitando puntos, guiones y espacios.
     * Ejemplo: " 19.123.456-k " -> "19123456K"
     */
    static clean(rut: string): string {
        if (!rut) return '';
        return rut.replace(/[^0-9kK]/g, '').toUpperCase();
    }

    /**
     * Formatea un RUT al estándar de la base de datos (Sin puntos, con guion).
     * Ejemplo: "19123456K" -> "19123456-K"
     */
    static format(rut: string): string {
        const cleanRut = this.clean(rut);
        if (cleanRut.length <= 1) return cleanRut;
        
        const body = cleanRut.slice(0, -1);
        const dv = cleanRut.slice(-1);
        
        return `${body}-${dv}`;
    }
}