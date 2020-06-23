export interface Entity {
    $table?: string;
    _id?: string;
    _rev?: string;
    _deleted?: boolean;
    created?: Date;
    lastModified?: Date;
}
