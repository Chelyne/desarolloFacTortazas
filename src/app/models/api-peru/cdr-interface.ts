export interface CDRInterface {
    xml?: string;
    hash?: string;
    sunatResponse?: SunatResponseInterface;
}

export interface SunatResponseInterface {
    success?: boolean;
    error?: {
        code?: string;
        message?: string
    };
    cdrZip?: string;
    cdrResponse?: CdrResponseInterface;

}

export interface CdrResponseInterface {
    accepted?: boolean;
    id?: string;
    code?: string;
    description?: string;
    notes?: string[];
}

