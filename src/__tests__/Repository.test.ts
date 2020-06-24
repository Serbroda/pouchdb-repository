import { Entity } from '../Entity';
import { Repository } from '../Repository';

interface ITestEntity extends Entity {
    name: string;
    age: number;
}

class TestEntityRepository extends Repository<ITestEntity> {
    constructor() {
        super('test');
    }
}

const repo = new TestEntityRepository();

it('should save doc', async () => {
    const entity = await repo.save({ name: 'John', age: 29 });
    expect(entity).toBeTruthy();
});
