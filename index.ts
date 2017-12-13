import * as A from "aliq"
import * as I from "iterator-lib"
import { nameValue } from "iterator-lib";

export function filter<T>(input: A.Bag<T>, func: (v: T) => boolean): A.Bag<T> {
    return A.flatMap(input, v => func(v) ? [v] : [])
}

export function compact<T>(input: A.Bag<T>): A.Bag<T> {
    return filter(input, Boolean)
}

export function map<T, V>(input: A.Bag<V>, func: (i: V) => T): A.Bag<T> {
    return A.flatMap(input, v => [func(v)])
}

export function groupBy<T>(input: A.Bag<[string, T]>, reduce: (a: T, b: T) => T): A.Bag<[string, T]>
{
    return A.groupBy(input, reduce, v => [v])
}

export function countBy<T>(input: A.Bag<T>, name: (v: T) => string): A.Bag<[string, number]> {
    const pairs = map(input, v => I.nameValue(name(v), 1))
    return groupBy(pairs, (a, b) => a + b)
}

export function reduce<T>(input: A.Bag<T>, func: (a: T, b: T) => T, init?: T): A.Bag<T> {
    const x = init === undefined ? input : A.merge([input, A.const_(init)])
    const pairs = map(input, v => I.nameValue("", v))
    return A.groupBy(pairs, func, e => [e[1]])
}

export function every<T>(input: A.Bag<T>, func: (v: T) => boolean): A.Bag<boolean> {
    return reduce(map(input, func), (a, b) => a && b, true)
}

export function flatten<T>(input: A.Bag<T[]>): A.Bag<T> {
    return A.flatMap(input, v => v)
}

export function intersection(a: A.Bag<string>, b: A.Bag<string>): A.Bag<string> {
    const ap = map(a, v => nameValue(v, { a: 1, b: 0 }))
    const bp = map(b, v => nameValue(v, { a: 0, b: 1 }))
    const p = A.merge([ap, bp])
    const g = A.groupBy(
        p,
        (v0, v1) => ({ a: v0.a + v1.a, b: v0.b + v1.b }),
        v => {
            const value = v[1]
            const min = Math.min(value.a, value.b)
            return min > 0 ? [nameValue(v[0], min)] : []
        })
    return A.flatMap(g, v => I.repeat(v[0], v[1]))
}

export function isEmpty<T>(input: A.Bag<T>): A.Bag<boolean> {
    return reduce(map(input, () => true), (a, b) => a || b, false)
}

export function max(a: A.Bag<number>): A.Bag<number> {
    return reduce(a, Math.max)
}

export function min(a: A.Bag<number>): A.Bag<number> {
    return reduce(a, Math.min)
}

export function none<T>(input: A.Bag<T>, f: (v: T) => boolean): A.Bag<boolean> {
    return map(reduce(map(input, f), (a, b) => a || b, false), v => !v)
}

export function pluck<T>(input: A.Bag<I.ObjectAsMap<T>>, name: string): A.Bag<T> {
    return map(input, v => v[name])
}

export function reject<T>(input: A.Bag<T>, f: (v: T) => boolean): A.Bag<T> {
    return filter(input, v => !f(v))
}

export function size<T>(input: A.Bag<T>): A.Bag<number> {
    const x = map(input, _ => 1)
    return reduce(x, (a, b) => a + b, 0)
}