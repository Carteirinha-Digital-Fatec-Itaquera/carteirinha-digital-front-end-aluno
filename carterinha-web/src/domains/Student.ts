export class Student {
    id: string;
    ra: string;
    name: string;
    email: string;
    rg: string;
    cpf: string;
    course: string;
    period: string;
    status: string;
    admission: string;
    birthDate: string;
    dueDate: string;
    photo: string;
    qrcode: string;

    constructor(props: {
        id?: string;
        ra?: string;
        name?: string;
        email?: string;
        rg?: string;
        cpf?: string;
        course?: string;
        period?: string;
        status?: string;
        admission?: string;
        birthDate?: string;
        dueDate?: string;
        photo?: string;
        qrcode?: string;
    }) {
        this.id = props.id ?? "";
        this.ra = props.ra ?? "";
        this.name = props.name ?? "";
        this.email = props.email ?? "";
        this.rg = props.rg ?? "";
        this.cpf = props.cpf ?? "";
        this.course = props.course ?? "";
        this.period = props.period ?? "";
        this.status = props.status ?? "";
        this.admission = props.admission ?? "";
        this.birthDate = props.birthDate ?? "";
        this.dueDate = props.dueDate ?? "";
        this.photo = props.photo ?? "";
        this.qrcode = props.qrcode ?? "";
    }
}
