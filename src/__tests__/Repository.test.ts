import { Entity } from '../Entity';
import { Repository } from '../Repository';

interface ITestEntity extends Entity {
    name?: string;
    age?: number;
}

class TestEntityRepository extends Repository<ITestEntity> {
    constructor() {
        super('test');
    }
}

const repo = new TestEntityRepository();
const createEntity = (data?: ITestEntity) => {
    return { ...{ name: 'John', age: 29 }, ...data } as ITestEntity;
};

beforeEach(async () => {
    await repo.clear();
    repo.removeAllChangeListener();
});

it('should create repository', () => {
    const repo1 = new TestEntityRepository();
    expect(repo1).not.toBeUndefined();
    expect(repo1).not.toBeNull();
});

it('should save entity', async () => {
    const entity = await repo.save(createEntity());
    expect(entity).not.toBeUndefined();
    expect(entity).not.toBeNull();
});

it('should generate id', async () => {
    const entity = await repo.save(createEntity());
    expect(entity._id).toMatch(/^[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}$/);
});

it('should save all entities', async () => {
    const entities = await repo.saveAll([createEntity(), createEntity()]);
    expect(entities).not.toBeUndefined();
    expect(entities).not.toBeNull();
    expect(entities.length).toBe(2);
});

it('should get entity by id', async () => {
    const id = (await repo.save(createEntity()))._id;
    const entity = await repo.get(id!);
    expect(entity).not.toBeUndefined();
    expect(entity).not.toBeNull();
});

it('should query entities', async () => {
    await repo.save(createEntity({ name: 'Max', age: 45 }));
    await repo.save(createEntity({ name: 'Julia', age: 26 }));
    await repo.save(createEntity({ name: 'Emma', age: 26 }));

    const results1 = await repo.query();
    expect(results1).not.toBeUndefined();
    expect(results1).not.toBeNull();
    expect(results1.length).toBe(3);

    const results2 = await repo.query({ selector: { name: 'Julia' } });
    expect(results2).not.toBeUndefined();
    expect(results2).not.toBeNull();
    expect(results2.length).toBe(1);
    expect(results2[0].name).toBe('Julia');

    const results3 = await repo.query({ selector: { age: 26 } });
    expect(results3).not.toBeUndefined();
    expect(results3).not.toBeNull();
    expect(results3.length).toBe(2);
    expect(results3[0].age).toBe(26);
});

it('should clear repository', async () => {
    const entities = await repo.saveAll([createEntity(), createEntity()]);
    expect(entities).not.toBeUndefined();
    expect(entities).not.toBeNull();
    expect(entities.length).toBe(2);

    await repo.clear();
    const results1 = await repo.query();
    expect(results1).not.toBeUndefined();
    expect(results1).not.toBeNull();
    expect(results1.length).toBe(0);
});

it('should remove entity', async () => {
    const entity1 = await repo.save(createEntity());
    const entity2 = await repo.save(createEntity());
    const entity3 = await repo.save(createEntity());
    const entity4 = await repo.save(createEntity());

    let results = await repo.query();
    expect(results.length).toBe(4);

    await repo.remove({});
    results = await repo.query();
    expect(results.length).toBe(4);

    await repo.remove(entity1);
    results = await repo.query();
    expect(results.length).toBe(3);

    await repo.remove(entity2._id!);
    results = await repo.query();
    expect(results.length).toBe(2);

    class TestEntityRepositoryWithNonDeletedFlag extends Repository<ITestEntity> {
        constructor() {
            super('test', {
                db: { name: 'db' },
                deletedFlag: false,
            });
        }
    }

    const repo2 = new TestEntityRepositoryWithNonDeletedFlag();

    await repo2.remove({ _id: entity3._id });
    results = await repo2.query();
    expect(results.length).toBe(1);
});

it('should remove all given entities', async () => {
    const entity1 = await repo.save(createEntity());
    const entity2 = await repo.save(createEntity());
    const entity3 = await repo.save(createEntity());
    const entity4 = await repo.save(createEntity());

    let results = await repo.query();
    expect(results.length).toBe(4);

    await repo.removeAll([entity1, entity2, entity3]);
    results = await repo.query();
    expect(results.length).toBe(1);
});

it('should listen for changes', (done: jest.DoneCallback) => {
    const callback = (item: any) => {
        expect(item).not.toBeUndefined();
        expect(item).not.toBeNull();
        expect(item.name).toBe('Anna');
        done();
    };
    repo.onChange(callback);

    setTimeout(async () => {
        await repo.save(createEntity({ name: 'Anna' }));
    }, 200);
});

it('should not listen after listener removed', (done: jest.DoneCallback) => {
    const callback = jest.fn();
    repo.onChange(callback);
    repo.removeOnChangeListener(callback);

    setTimeout(async () => {
        await repo.save(createEntity());
        setTimeout(() => {
            expect(callback).not.toHaveBeenCalled();
            done();
        }, 500);
    }, 200);
});

it('should difference between multiple repositories', async () => {
    class TestEntityRepository2 extends Repository<ITestEntity> {
        constructor() {
            super('test2');
        }
    }

    const repo2 = new TestEntityRepository2();

    await repo.saveAll([
        createEntity({ name: 'Julia' }),
        createEntity({ name: 'Hannah' }),
        createEntity({ name: 'Mike' }),
        createEntity({ name: 'Gerorge' }),
        createEntity({ name: 'Iris' }),
        createEntity({ name: 'Steve' }),
    ]);
    await repo2.saveAll([createEntity({ name: 'Peter' }), createEntity({ name: 'Iris' })]);

    const result1 = await repo.query();
    expect(result1.length).toBe(6);
    expect(result1.filter((i) => i.name == 'Mike').length).toBe(1);
    expect(result1.filter((i) => i.name == 'Peter').length).toBe(0);
    expect((await repo.query({ selector: { name: 'Iris' } })).length).toBe(1);

    const result2 = await repo2.query();
    expect(result2.length).toBe(2);
    expect(result2.filter((i) => i.name == 'Mike').length).toBe(0);
    expect(result2.filter((i) => i.name == 'Peter').length).toBe(1);
    expect((await repo2.query({ selector: { name: 'Iris' } })).length).toBe(1);
});
