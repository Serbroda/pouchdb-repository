/// <reference types="pouchdb-core" />
/// <reference types="pouchdb-find" />
import { Entity } from './Entity';
export interface RepositoryOptions extends PouchDB.Configuration.LocalDatabaseConfiguration {
}
export declare type OnRepositoryChange<T> = {
    (data: T): void;
};
export declare class Repository<T extends Entity> {
    private readonly name;
    private readonly options;
    private readonly db;
    private changeListeners;
    constructor(name: string, options?: RepositoryOptions);
    save(item: T): Promise<T>;
    saveAll(items: T[]): Promise<T[]>;
    get(id: string, options?: PouchDB.Core.GetOptions): Promise<T | undefined>;
    remove(item: string | T): Promise<void>;
    removeAll(items: (string | T)[]): Promise<void>;
    query(options?: PouchDB.Find.FindRequest<T>): Promise<T[]>;
    clear(): Promise<void>;
    onChange(handler: OnRepositoryChange<T>): void;
    removeOnChangeListener(handler: OnRepositoryChange<T>): void;
    removeAllChangeListener(): void;
    private _isNew;
}
//# sourceMappingURL=Repository.d.ts.map