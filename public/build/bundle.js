
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value' || descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function get_binding_group_value(group) {
        const value = [];
        for (let i = 0; i < group.length; i += 1) {
            if (group[i].checked)
                value.push(group[i].__value);
        }
        return value;
    }
    function to_number(value) {
        return value === '' ? undefined : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        if (value != null || input.value) {
            input.value = value;
        }
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined' ? window : global);
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next, lookup.has(block.key));
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error(`Cannot have duplicate keys in a keyed each`);
            }
            keys.add(key);
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.20.1' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev("SvelteDOMSetProperty", { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe,
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    const LOCATION = {};
    const ROUTER = {};

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/history.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     * */

    function getLocation(source) {
      return {
        ...source.location,
        state: source.history.state,
        key: (source.history.state && source.history.state.key) || "initial"
      };
    }

    function createHistory(source, options) {
      const listeners = [];
      let location = getLocation(source);

      return {
        get location() {
          return location;
        },

        listen(listener) {
          listeners.push(listener);

          const popstateListener = () => {
            location = getLocation(source);
            listener({ location, action: "POP" });
          };

          source.addEventListener("popstate", popstateListener);

          return () => {
            source.removeEventListener("popstate", popstateListener);

            const index = listeners.indexOf(listener);
            listeners.splice(index, 1);
          };
        },

        navigate(to, { state, replace = false } = {}) {
          state = { ...state, key: Date.now() + "" };
          // try...catch iOS Safari limits to 100 pushState calls
          try {
            if (replace) {
              source.history.replaceState(state, null, to);
            } else {
              source.history.pushState(state, null, to);
            }
          } catch (e) {
            source.location[replace ? "replace" : "assign"](to);
          }

          location = getLocation(source);
          listeners.forEach(listener => listener({ location, action: "PUSH" }));
        }
      };
    }

    // Stores history entries in memory for testing or other platforms like Native
    function createMemorySource(initialPathname = "/") {
      let index = 0;
      const stack = [{ pathname: initialPathname, search: "" }];
      const states = [];

      return {
        get location() {
          return stack[index];
        },
        addEventListener(name, fn) {},
        removeEventListener(name, fn) {},
        history: {
          get entries() {
            return stack;
          },
          get index() {
            return index;
          },
          get state() {
            return states[index];
          },
          pushState(state, _, uri) {
            const [pathname, search = ""] = uri.split("?");
            index++;
            stack.push({ pathname, search });
            states.push(state);
          },
          replaceState(state, _, uri) {
            const [pathname, search = ""] = uri.split("?");
            stack[index] = { pathname, search };
            states[index] = state;
          }
        }
      };
    }

    // Global history uses window.history as the source if available,
    // otherwise a memory history
    const canUseDOM = Boolean(
      typeof window !== "undefined" &&
        window.document &&
        window.document.createElement
    );
    const globalHistory = createHistory(canUseDOM ? window : createMemorySource());
    const { navigate } = globalHistory;

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/utils.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     * */

    const paramRe = /^:(.+)/;

    const SEGMENT_POINTS = 4;
    const STATIC_POINTS = 3;
    const DYNAMIC_POINTS = 2;
    const SPLAT_PENALTY = 1;
    const ROOT_POINTS = 1;

    /**
     * Check if `string` starts with `search`
     * @param {string} string
     * @param {string} search
     * @return {boolean}
     */
    function startsWith(string, search) {
      return string.substr(0, search.length) === search;
    }

    /**
     * Check if `segment` is a root segment
     * @param {string} segment
     * @return {boolean}
     */
    function isRootSegment(segment) {
      return segment === "";
    }

    /**
     * Check if `segment` is a dynamic segment
     * @param {string} segment
     * @return {boolean}
     */
    function isDynamic(segment) {
      return paramRe.test(segment);
    }

    /**
     * Check if `segment` is a splat
     * @param {string} segment
     * @return {boolean}
     */
    function isSplat(segment) {
      return segment[0] === "*";
    }

    /**
     * Split up the URI into segments delimited by `/`
     * @param {string} uri
     * @return {string[]}
     */
    function segmentize(uri) {
      return (
        uri
          // Strip starting/ending `/`
          .replace(/(^\/+|\/+$)/g, "")
          .split("/")
      );
    }

    /**
     * Strip `str` of potential start and end `/`
     * @param {string} str
     * @return {string}
     */
    function stripSlashes(str) {
      return str.replace(/(^\/+|\/+$)/g, "");
    }

    /**
     * Score a route depending on how its individual segments look
     * @param {object} route
     * @param {number} index
     * @return {object}
     */
    function rankRoute(route, index) {
      const score = route.default
        ? 0
        : segmentize(route.path).reduce((score, segment) => {
            score += SEGMENT_POINTS;

            if (isRootSegment(segment)) {
              score += ROOT_POINTS;
            } else if (isDynamic(segment)) {
              score += DYNAMIC_POINTS;
            } else if (isSplat(segment)) {
              score -= SEGMENT_POINTS + SPLAT_PENALTY;
            } else {
              score += STATIC_POINTS;
            }

            return score;
          }, 0);

      return { route, score, index };
    }

    /**
     * Give a score to all routes and sort them on that
     * @param {object[]} routes
     * @return {object[]}
     */
    function rankRoutes(routes) {
      return (
        routes
          .map(rankRoute)
          // If two routes have the exact same score, we go by index instead
          .sort((a, b) =>
            a.score < b.score ? 1 : a.score > b.score ? -1 : a.index - b.index
          )
      );
    }

    /**
     * Ranks and picks the best route to match. Each segment gets the highest
     * amount of points, then the type of segment gets an additional amount of
     * points where
     *
     *  static > dynamic > splat > root
     *
     * This way we don't have to worry about the order of our routes, let the
     * computers do it.
     *
     * A route looks like this
     *
     *  { path, default, value }
     *
     * And a returned match looks like:
     *
     *  { route, params, uri }
     *
     * @param {object[]} routes
     * @param {string} uri
     * @return {?object}
     */
    function pick(routes, uri) {
      let match;
      let default_;

      const [uriPathname] = uri.split("?");
      const uriSegments = segmentize(uriPathname);
      const isRootUri = uriSegments[0] === "";
      const ranked = rankRoutes(routes);

      for (let i = 0, l = ranked.length; i < l; i++) {
        const route = ranked[i].route;
        let missed = false;

        if (route.default) {
          default_ = {
            route,
            params: {},
            uri
          };
          continue;
        }

        const routeSegments = segmentize(route.path);
        const params = {};
        const max = Math.max(uriSegments.length, routeSegments.length);
        let index = 0;

        for (; index < max; index++) {
          const routeSegment = routeSegments[index];
          const uriSegment = uriSegments[index];

          if (routeSegment !== undefined && isSplat(routeSegment)) {
            // Hit a splat, just grab the rest, and return a match
            // uri:   /files/documents/work
            // route: /files/* or /files/*splatname
            const splatName = routeSegment === "*" ? "*" : routeSegment.slice(1);

            params[splatName] = uriSegments
              .slice(index)
              .map(decodeURIComponent)
              .join("/");
            break;
          }

          if (uriSegment === undefined) {
            // URI is shorter than the route, no match
            // uri:   /users
            // route: /users/:userId
            missed = true;
            break;
          }

          let dynamicMatch = paramRe.exec(routeSegment);

          if (dynamicMatch && !isRootUri) {
            const value = decodeURIComponent(uriSegment);
            params[dynamicMatch[1]] = value;
          } else if (routeSegment !== uriSegment) {
            // Current segments don't match, not dynamic, not splat, so no match
            // uri:   /users/123/settings
            // route: /users/:id/profile
            missed = true;
            break;
          }
        }

        if (!missed) {
          match = {
            route,
            params,
            uri: "/" + uriSegments.slice(0, index).join("/")
          };
          break;
        }
      }

      return match || default_ || null;
    }

    /**
     * Check if the `path` matches the `uri`.
     * @param {string} path
     * @param {string} uri
     * @return {?object}
     */
    function match(route, uri) {
      return pick([route], uri);
    }

    /**
     * Add the query to the pathname if a query is given
     * @param {string} pathname
     * @param {string} [query]
     * @return {string}
     */
    function addQuery(pathname, query) {
      return pathname + (query ? `?${query}` : "");
    }

    /**
     * Resolve URIs as though every path is a directory, no files. Relative URIs
     * in the browser can feel awkward because not only can you be "in a directory",
     * you can be "at a file", too. For example:
     *
     *  browserSpecResolve('foo', '/bar/') => /bar/foo
     *  browserSpecResolve('foo', '/bar') => /foo
     *
     * But on the command line of a file system, it's not as complicated. You can't
     * `cd` from a file, only directories. This way, links have to know less about
     * their current path. To go deeper you can do this:
     *
     *  <Link to="deeper"/>
     *  // instead of
     *  <Link to=`{${props.uri}/deeper}`/>
     *
     * Just like `cd`, if you want to go deeper from the command line, you do this:
     *
     *  cd deeper
     *  # not
     *  cd $(pwd)/deeper
     *
     * By treating every path as a directory, linking to relative paths should
     * require less contextual information and (fingers crossed) be more intuitive.
     * @param {string} to
     * @param {string} base
     * @return {string}
     */
    function resolve(to, base) {
      // /foo/bar, /baz/qux => /foo/bar
      if (startsWith(to, "/")) {
        return to;
      }

      const [toPathname, toQuery] = to.split("?");
      const [basePathname] = base.split("?");
      const toSegments = segmentize(toPathname);
      const baseSegments = segmentize(basePathname);

      // ?a=b, /users?b=c => /users?a=b
      if (toSegments[0] === "") {
        return addQuery(basePathname, toQuery);
      }

      // profile, /users/789 => /users/789/profile
      if (!startsWith(toSegments[0], ".")) {
        const pathname = baseSegments.concat(toSegments).join("/");

        return addQuery((basePathname === "/" ? "" : "/") + pathname, toQuery);
      }

      // ./       , /users/123 => /users/123
      // ../      , /users/123 => /users
      // ../..    , /users/123 => /
      // ../../one, /a/b/c/d   => /a/b/one
      // .././one , /a/b/c/d   => /a/b/c/one
      const allSegments = baseSegments.concat(toSegments);
      const segments = [];

      allSegments.forEach(segment => {
        if (segment === "..") {
          segments.pop();
        } else if (segment !== ".") {
          segments.push(segment);
        }
      });

      return addQuery("/" + segments.join("/"), toQuery);
    }

    /**
     * Combines the `basepath` and the `path` into one path.
     * @param {string} basepath
     * @param {string} path
     */
    function combinePaths(basepath, path) {
      return `${stripSlashes(
    path === "/" ? basepath : `${stripSlashes(basepath)}/${stripSlashes(path)}`
  )}/`;
    }

    /**
     * Decides whether a given `event` should result in a navigation or not.
     * @param {object} event
     */
    function shouldNavigate(event) {
      return (
        !event.defaultPrevented &&
        event.button === 0 &&
        !(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey)
      );
    }

    function hostMatches(anchor) {
      const host = location.host;
      return (
        anchor.host == host ||
        // svelte seems to kill anchor.host value in ie11, so fall back to checking href
        anchor.href.indexOf(`https://${host}`) === 0 ||
        anchor.href.indexOf(`http://${host}`) === 0
      )
    }

    /* node_modules\svelte-routing\src\Router.svelte generated by Svelte v3.20.1 */

    function create_fragment(ctx) {
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[16].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[15], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 32768) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[15], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[15], dirty, null));
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $base;
    	let $location;
    	let $routes;
    	let { basepath = "/" } = $$props;
    	let { url = null } = $$props;
    	const locationContext = getContext(LOCATION);
    	const routerContext = getContext(ROUTER);
    	const routes = writable([]);
    	validate_store(routes, "routes");
    	component_subscribe($$self, routes, value => $$invalidate(8, $routes = value));
    	const activeRoute = writable(null);
    	let hasActiveRoute = false; // Used in SSR to synchronously set that a Route is active.

    	// If locationContext is not set, this is the topmost Router in the tree.
    	// If the `url` prop is given we force the location to it.
    	const location = locationContext || writable(url ? { pathname: url } : globalHistory.location);

    	validate_store(location, "location");
    	component_subscribe($$self, location, value => $$invalidate(7, $location = value));

    	// If routerContext is set, the routerBase of the parent Router
    	// will be the base for this Router's descendants.
    	// If routerContext is not set, the path and resolved uri will both
    	// have the value of the basepath prop.
    	const base = routerContext
    	? routerContext.routerBase
    	: writable({ path: basepath, uri: basepath });

    	validate_store(base, "base");
    	component_subscribe($$self, base, value => $$invalidate(6, $base = value));

    	const routerBase = derived([base, activeRoute], ([base, activeRoute]) => {
    		// If there is no activeRoute, the routerBase will be identical to the base.
    		if (activeRoute === null) {
    			return base;
    		}

    		const { path: basepath } = base;
    		const { route, uri } = activeRoute;

    		// Remove the potential /* or /*splatname from
    		// the end of the child Routes relative paths.
    		const path = route.default
    		? basepath
    		: route.path.replace(/\*.*$/, "");

    		return { path, uri };
    	});

    	function registerRoute(route) {
    		const { path: basepath } = $base;
    		let { path } = route;

    		// We store the original path in the _path property so we can reuse
    		// it when the basepath changes. The only thing that matters is that
    		// the route reference is intact, so mutation is fine.
    		route._path = path;

    		route.path = combinePaths(basepath, path);

    		if (typeof window === "undefined") {
    			// In SSR we should set the activeRoute immediately if it is a match.
    			// If there are more Routes being registered after a match is found,
    			// we just skip them.
    			if (hasActiveRoute) {
    				return;
    			}

    			const matchingRoute = match(route, $location.pathname);

    			if (matchingRoute) {
    				activeRoute.set(matchingRoute);
    				hasActiveRoute = true;
    			}
    		} else {
    			routes.update(rs => {
    				rs.push(route);
    				return rs;
    			});
    		}
    	}

    	function unregisterRoute(route) {
    		routes.update(rs => {
    			const index = rs.indexOf(route);
    			rs.splice(index, 1);
    			return rs;
    		});
    	}

    	if (!locationContext) {
    		// The topmost Router in the tree is responsible for updating
    		// the location store and supplying it through context.
    		onMount(() => {
    			const unlisten = globalHistory.listen(history => {
    				location.set(history.location);
    			});

    			return unlisten;
    		});

    		setContext(LOCATION, location);
    	}

    	setContext(ROUTER, {
    		activeRoute,
    		base,
    		routerBase,
    		registerRoute,
    		unregisterRoute
    	});

    	const writable_props = ["basepath", "url"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Router", $$slots, ['default']);

    	$$self.$set = $$props => {
    		if ("basepath" in $$props) $$invalidate(3, basepath = $$props.basepath);
    		if ("url" in $$props) $$invalidate(4, url = $$props.url);
    		if ("$$scope" in $$props) $$invalidate(15, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		setContext,
    		onMount,
    		writable,
    		derived,
    		LOCATION,
    		ROUTER,
    		globalHistory,
    		pick,
    		match,
    		stripSlashes,
    		combinePaths,
    		basepath,
    		url,
    		locationContext,
    		routerContext,
    		routes,
    		activeRoute,
    		hasActiveRoute,
    		location,
    		base,
    		routerBase,
    		registerRoute,
    		unregisterRoute,
    		$base,
    		$location,
    		$routes
    	});

    	$$self.$inject_state = $$props => {
    		if ("basepath" in $$props) $$invalidate(3, basepath = $$props.basepath);
    		if ("url" in $$props) $$invalidate(4, url = $$props.url);
    		if ("hasActiveRoute" in $$props) hasActiveRoute = $$props.hasActiveRoute;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$base*/ 64) {
    			// This reactive statement will update all the Routes' path when
    			// the basepath changes.
    			 {
    				const { path: basepath } = $base;

    				routes.update(rs => {
    					rs.forEach(r => r.path = combinePaths(basepath, r._path));
    					return rs;
    				});
    			}
    		}

    		if ($$self.$$.dirty & /*$routes, $location*/ 384) {
    			// This reactive statement will be run when the Router is created
    			// when there are no Routes and then again the following tick, so it
    			// will not find an active Route in SSR and in the browser it will only
    			// pick an active Route after all Routes have been registered.
    			 {
    				const bestMatch = pick($routes, $location.pathname);
    				activeRoute.set(bestMatch);
    			}
    		}
    	};

    	return [
    		routes,
    		location,
    		base,
    		basepath,
    		url,
    		hasActiveRoute,
    		$base,
    		$location,
    		$routes,
    		locationContext,
    		routerContext,
    		activeRoute,
    		routerBase,
    		registerRoute,
    		unregisterRoute,
    		$$scope,
    		$$slots
    	];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { basepath: 3, url: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get basepath() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set basepath(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get url() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-routing\src\Route.svelte generated by Svelte v3.20.1 */

    const get_default_slot_changes = dirty => ({
    	params: dirty & /*routeParams*/ 2,
    	location: dirty & /*$location*/ 16
    });

    const get_default_slot_context = ctx => ({
    	params: /*routeParams*/ ctx[1],
    	location: /*$location*/ ctx[4]
    });

    // (40:0) {#if $activeRoute !== null && $activeRoute.route === route}
    function create_if_block(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*component*/ ctx[0] !== null) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(40:0) {#if $activeRoute !== null && $activeRoute.route === route}",
    		ctx
    	});

    	return block;
    }

    // (43:2) {:else}
    function create_else_block(ctx) {
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[13].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[12], get_default_slot_context);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope, routeParams, $location*/ 4114) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[12], get_default_slot_context), get_slot_changes(default_slot_template, /*$$scope*/ ctx[12], dirty, get_default_slot_changes));
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(43:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (41:2) {#if component !== null}
    function create_if_block_1(ctx) {
    	let switch_instance_anchor;
    	let current;

    	const switch_instance_spread_levels = [
    		{ location: /*$location*/ ctx[4] },
    		/*routeParams*/ ctx[1],
    		/*routeProps*/ ctx[2]
    	];

    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		var switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*$location, routeParams, routeProps*/ 22)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*$location*/ 16 && { location: /*$location*/ ctx[4] },
    					dirty & /*routeParams*/ 2 && get_spread_object(/*routeParams*/ ctx[1]),
    					dirty & /*routeProps*/ 4 && get_spread_object(/*routeProps*/ ctx[2])
    				])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(41:2) {#if component !== null}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*$activeRoute*/ ctx[3] !== null && /*$activeRoute*/ ctx[3].route === /*route*/ ctx[7] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$activeRoute*/ ctx[3] !== null && /*$activeRoute*/ ctx[3].route === /*route*/ ctx[7]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $activeRoute;
    	let $location;
    	let { path = "" } = $$props;
    	let { component = null } = $$props;
    	const { registerRoute, unregisterRoute, activeRoute } = getContext(ROUTER);
    	validate_store(activeRoute, "activeRoute");
    	component_subscribe($$self, activeRoute, value => $$invalidate(3, $activeRoute = value));
    	const location = getContext(LOCATION);
    	validate_store(location, "location");
    	component_subscribe($$self, location, value => $$invalidate(4, $location = value));

    	const route = {
    		path,
    		// If no path prop is given, this Route will act as the default Route
    		// that is rendered if no other Route in the Router is a match.
    		default: path === ""
    	};

    	let routeParams = {};
    	let routeProps = {};
    	registerRoute(route);

    	// There is no need to unregister Routes in SSR since it will all be
    	// thrown away anyway.
    	if (typeof window !== "undefined") {
    		onDestroy(() => {
    			unregisterRoute(route);
    		});
    	}

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Route", $$slots, ['default']);

    	$$self.$set = $$new_props => {
    		$$invalidate(11, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("path" in $$new_props) $$invalidate(8, path = $$new_props.path);
    		if ("component" in $$new_props) $$invalidate(0, component = $$new_props.component);
    		if ("$$scope" in $$new_props) $$invalidate(12, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		onDestroy,
    		ROUTER,
    		LOCATION,
    		path,
    		component,
    		registerRoute,
    		unregisterRoute,
    		activeRoute,
    		location,
    		route,
    		routeParams,
    		routeProps,
    		$activeRoute,
    		$location
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(11, $$props = assign(assign({}, $$props), $$new_props));
    		if ("path" in $$props) $$invalidate(8, path = $$new_props.path);
    		if ("component" in $$props) $$invalidate(0, component = $$new_props.component);
    		if ("routeParams" in $$props) $$invalidate(1, routeParams = $$new_props.routeParams);
    		if ("routeProps" in $$props) $$invalidate(2, routeProps = $$new_props.routeProps);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$activeRoute*/ 8) {
    			 if ($activeRoute && $activeRoute.route === route) {
    				$$invalidate(1, routeParams = $activeRoute.params);
    			}
    		}

    		 {
    			const { path, component, ...rest } = $$props;
    			$$invalidate(2, routeProps = rest);
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		component,
    		routeParams,
    		routeProps,
    		$activeRoute,
    		$location,
    		activeRoute,
    		location,
    		route,
    		path,
    		registerRoute,
    		unregisterRoute,
    		$$props,
    		$$scope,
    		$$slots
    	];
    }

    class Route extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { path: 8, component: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Route",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get path() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get component() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set component(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-routing\src\Link.svelte generated by Svelte v3.20.1 */
    const file = "node_modules\\svelte-routing\\src\\Link.svelte";

    function create_fragment$2(ctx) {
    	let a;
    	let current;
    	let dispose;
    	const default_slot_template = /*$$slots*/ ctx[16].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[15], null);

    	let a_levels = [
    		{ href: /*href*/ ctx[0] },
    		{ "aria-current": /*ariaCurrent*/ ctx[2] },
    		/*props*/ ctx[1]
    	];

    	let a_data = {};

    	for (let i = 0; i < a_levels.length; i += 1) {
    		a_data = assign(a_data, a_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			a = element("a");
    			if (default_slot) default_slot.c();
    			set_attributes(a, a_data);
    			add_location(a, file, 40, 0, 1249);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, a, anchor);

    			if (default_slot) {
    				default_slot.m(a, null);
    			}

    			current = true;
    			if (remount) dispose();
    			dispose = listen_dev(a, "click", /*onClick*/ ctx[5], false, false, false);
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 32768) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[15], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[15], dirty, null));
    				}
    			}

    			set_attributes(a, get_spread_update(a_levels, [
    				dirty & /*href*/ 1 && { href: /*href*/ ctx[0] },
    				dirty & /*ariaCurrent*/ 4 && { "aria-current": /*ariaCurrent*/ ctx[2] },
    				dirty & /*props*/ 2 && /*props*/ ctx[1]
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if (default_slot) default_slot.d(detaching);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $base;
    	let $location;
    	let { to = "#" } = $$props;
    	let { replace = false } = $$props;
    	let { state = {} } = $$props;
    	let { getProps = () => ({}) } = $$props;
    	const { base } = getContext(ROUTER);
    	validate_store(base, "base");
    	component_subscribe($$self, base, value => $$invalidate(12, $base = value));
    	const location = getContext(LOCATION);
    	validate_store(location, "location");
    	component_subscribe($$self, location, value => $$invalidate(13, $location = value));
    	const dispatch = createEventDispatcher();
    	let href, isPartiallyCurrent, isCurrent, props;

    	function onClick(event) {
    		dispatch("click", event);

    		if (shouldNavigate(event)) {
    			event.preventDefault();

    			// Don't push another entry to the history stack when the user
    			// clicks on a Link to the page they are currently on.
    			const shouldReplace = $location.pathname === href || replace;

    			navigate(href, { state, replace: shouldReplace });
    		}
    	}

    	const writable_props = ["to", "replace", "state", "getProps"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Link> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Link", $$slots, ['default']);

    	$$self.$set = $$props => {
    		if ("to" in $$props) $$invalidate(6, to = $$props.to);
    		if ("replace" in $$props) $$invalidate(7, replace = $$props.replace);
    		if ("state" in $$props) $$invalidate(8, state = $$props.state);
    		if ("getProps" in $$props) $$invalidate(9, getProps = $$props.getProps);
    		if ("$$scope" in $$props) $$invalidate(15, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		createEventDispatcher,
    		ROUTER,
    		LOCATION,
    		navigate,
    		startsWith,
    		resolve,
    		shouldNavigate,
    		to,
    		replace,
    		state,
    		getProps,
    		base,
    		location,
    		dispatch,
    		href,
    		isPartiallyCurrent,
    		isCurrent,
    		props,
    		onClick,
    		$base,
    		$location,
    		ariaCurrent
    	});

    	$$self.$inject_state = $$props => {
    		if ("to" in $$props) $$invalidate(6, to = $$props.to);
    		if ("replace" in $$props) $$invalidate(7, replace = $$props.replace);
    		if ("state" in $$props) $$invalidate(8, state = $$props.state);
    		if ("getProps" in $$props) $$invalidate(9, getProps = $$props.getProps);
    		if ("href" in $$props) $$invalidate(0, href = $$props.href);
    		if ("isPartiallyCurrent" in $$props) $$invalidate(10, isPartiallyCurrent = $$props.isPartiallyCurrent);
    		if ("isCurrent" in $$props) $$invalidate(11, isCurrent = $$props.isCurrent);
    		if ("props" in $$props) $$invalidate(1, props = $$props.props);
    		if ("ariaCurrent" in $$props) $$invalidate(2, ariaCurrent = $$props.ariaCurrent);
    	};

    	let ariaCurrent;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*to, $base*/ 4160) {
    			 $$invalidate(0, href = to === "/" ? $base.uri : resolve(to, $base.uri));
    		}

    		if ($$self.$$.dirty & /*$location, href*/ 8193) {
    			 $$invalidate(10, isPartiallyCurrent = startsWith($location.pathname, href));
    		}

    		if ($$self.$$.dirty & /*href, $location*/ 8193) {
    			 $$invalidate(11, isCurrent = href === $location.pathname);
    		}

    		if ($$self.$$.dirty & /*isCurrent*/ 2048) {
    			 $$invalidate(2, ariaCurrent = isCurrent ? "page" : undefined);
    		}

    		if ($$self.$$.dirty & /*getProps, $location, href, isPartiallyCurrent, isCurrent*/ 11777) {
    			 $$invalidate(1, props = getProps({
    				location: $location,
    				href,
    				isPartiallyCurrent,
    				isCurrent
    			}));
    		}
    	};

    	return [
    		href,
    		props,
    		ariaCurrent,
    		base,
    		location,
    		onClick,
    		to,
    		replace,
    		state,
    		getProps,
    		isPartiallyCurrent,
    		isCurrent,
    		$base,
    		$location,
    		dispatch,
    		$$scope,
    		$$slots
    	];
    }

    class Link extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { to: 6, replace: 7, state: 8, getProps: 9 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Link",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get to() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set to(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get replace() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set replace(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get state() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set state(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getProps() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getProps(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /**
     * An action to be added at a root element of your application to
     * capture all relative links and push them onto the history stack.
     *
     * Example:
     * ```html
     * <div use:links>
     *   <Router>
     *     <Route path="/" component={Home} />
     *     <Route path="/p/:projectId/:docId?" component={ProjectScreen} />
     *     {#each projects as project}
     *       <a href="/p/{project.id}">{project.title}</a>
     *     {/each}
     *   </Router>
     * </div>
     * ```
     */
    function links(node) {
      function findClosest(tagName, el) {
        while (el && el.tagName !== tagName) {
          el = el.parentNode;
        }
        return el;
      }

      function onClick(event) {
        const anchor = findClosest("A", event.target);

        if (
          anchor &&
          anchor.target === "" &&
          hostMatches(anchor) &&
          shouldNavigate(event) &&
          !anchor.hasAttribute("noroute")
        ) {
          event.preventDefault();
          navigate(anchor.pathname + anchor.search, { replace: anchor.hasAttribute("replace") });
        }
      }

      node.addEventListener("click", onClick);

      return {
        destroy() {
          node.removeEventListener("click", onClick);
        }
      };
    }

    /* src\client\routes\AddQuote.svelte generated by Svelte v3.20.1 */

    const file$1 = "src\\client\\routes\\AddQuote.svelte";

    // (68:4) {#if includeRating}
    function create_if_block$1(ctx) {
    	let div;
    	let label;
    	let t0;
    	let t1_value = /*input*/ ctx[0].rating + "";
    	let t1;
    	let t2;
    	let input_1;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			label = element("label");
    			t0 = text("Rating ");
    			t1 = text(t1_value);
    			t2 = space();
    			input_1 = element("input");
    			attr_dev(label, "for", "rating");
    			add_location(label, file$1, 69, 8, 1824);
    			attr_dev(input_1, "type", "range");
    			attr_dev(input_1, "class", "custom-range");
    			attr_dev(input_1, "id", "rating");
    			attr_dev(input_1, "name", "rating");
    			attr_dev(input_1, "min", "0");
    			attr_dev(input_1, "max", "5");
    			attr_dev(input_1, "step", "0.1");
    			add_location(input_1, file$1, 70, 8, 1883);
    			attr_dev(div, "class", "form-group");
    			add_location(div, file$1, 68, 6, 1790);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div, anchor);
    			append_dev(div, label);
    			append_dev(label, t0);
    			append_dev(label, t1);
    			append_dev(div, t2);
    			append_dev(div, input_1);
    			set_input_value(input_1, /*input*/ ctx[0].rating);
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(input_1, "change", /*input_1_change_input_handler*/ ctx[8]),
    				listen_dev(input_1, "input", /*input_1_change_input_handler*/ ctx[8])
    			];
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*input*/ 1 && t1_value !== (t1_value = /*input*/ ctx[0].rating + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*input*/ 1) {
    				set_input_value(input_1, /*input*/ ctx[0].rating);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(68:4) {#if includeRating}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div7;
    	let form;
    	let div2;
    	let label0;
    	let t1;
    	let input0;
    	let t2;
    	let div0;
    	let t4;
    	let div1;
    	let t6;
    	let div5;
    	let label1;
    	let t8;
    	let textarea;
    	let t9;
    	let div3;
    	let t11;
    	let div4;
    	let t13;
    	let div6;
    	let input1;
    	let t14;
    	let label2;
    	let t16;
    	let t17;
    	let button;
    	let dispose;
    	let if_block = /*includeRating*/ ctx[1] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div7 = element("div");
    			form = element("form");
    			div2 = element("div");
    			label0 = element("label");
    			label0.textContent = "Author's Name*";
    			t1 = space();
    			input0 = element("input");
    			t2 = space();
    			div0 = element("div");
    			div0.textContent = "Valid.";
    			t4 = space();
    			div1 = element("div");
    			div1.textContent = "Please fill out this field.";
    			t6 = space();
    			div5 = element("div");
    			label1 = element("label");
    			label1.textContent = "Quote Contents*";
    			t8 = space();
    			textarea = element("textarea");
    			t9 = space();
    			div3 = element("div");
    			div3.textContent = "Valid.";
    			t11 = space();
    			div4 = element("div");
    			div4.textContent = "Please fill out this field.";
    			t13 = space();
    			div6 = element("div");
    			input1 = element("input");
    			t14 = space();
    			label2 = element("label");
    			label2.textContent = "Include Rating";
    			t16 = space();
    			if (if_block) if_block.c();
    			t17 = space();
    			button = element("button");
    			button.textContent = "Submit Quote";
    			attr_dev(label0, "for", "author");
    			add_location(label0, file$1, 49, 6, 870);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "class", "form-control");
    			attr_dev(input0, "placeholder", "Enter name");
    			attr_dev(input0, "id", "author");
    			input0.required = true;
    			add_location(input0, file$1, 50, 6, 920);
    			attr_dev(div0, "class", "valid-feedback");
    			add_location(div0, file$1, 51, 6, 1045);
    			attr_dev(div1, "class", "invalid-feedback");
    			add_location(div1, file$1, 52, 6, 1093);
    			attr_dev(div2, "class", "form-group");
    			add_location(div2, file$1, 48, 4, 838);
    			attr_dev(label1, "for", "quote-contents");
    			add_location(label1, file$1, 56, 6, 1208);
    			attr_dev(textarea, "class", "form-control");
    			attr_dev(textarea, "rows", "5");
    			attr_dev(textarea, "id", "quote-contents");
    			textarea.required = true;
    			add_location(textarea, file$1, 57, 6, 1267);
    			attr_dev(div3, "class", "valid-feedback");
    			add_location(div3, file$1, 58, 6, 1377);
    			attr_dev(div4, "class", "invalid-feedback");
    			add_location(div4, file$1, 59, 6, 1425);
    			attr_dev(div5, "class", "form-group");
    			add_location(div5, file$1, 55, 4, 1176);
    			attr_dev(input1, "type", "checkbox");
    			attr_dev(input1, "class", "custom-control-input");
    			attr_dev(input1, "id", "switch1");
    			add_location(input1, file$1, 63, 6, 1569);
    			attr_dev(label2, "class", "custom-control-label");
    			attr_dev(label2, "for", "switch1");
    			add_location(label2, file$1, 64, 6, 1671);
    			attr_dev(div6, "class", "form-group custom-control custom-switch");
    			add_location(div6, file$1, 62, 4, 1508);
    			attr_dev(button, "type", "submit");
    			attr_dev(button, "class", "btn btn-primary");
    			add_location(button, file$1, 74, 4, 2036);
    			attr_dev(form, "class", "was-validated p-3 svelte-126g4jm");
    			add_location(form, file$1, 46, 2, 758);
    			attr_dev(div7, "class", "form-wrapper p-2");
    			add_location(div7, file$1, 44, 0, 722);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div7, anchor);
    			append_dev(div7, form);
    			append_dev(form, div2);
    			append_dev(div2, label0);
    			append_dev(div2, t1);
    			append_dev(div2, input0);
    			set_input_value(input0, /*input*/ ctx[0].author.name);
    			append_dev(div2, t2);
    			append_dev(div2, div0);
    			append_dev(div2, t4);
    			append_dev(div2, div1);
    			append_dev(form, t6);
    			append_dev(form, div5);
    			append_dev(div5, label1);
    			append_dev(div5, t8);
    			append_dev(div5, textarea);
    			set_input_value(textarea, /*input*/ ctx[0].en);
    			append_dev(div5, t9);
    			append_dev(div5, div3);
    			append_dev(div5, t11);
    			append_dev(div5, div4);
    			append_dev(form, t13);
    			append_dev(form, div6);
    			append_dev(div6, input1);
    			input1.checked = /*includeRating*/ ctx[1];
    			append_dev(div6, t14);
    			append_dev(div6, label2);
    			append_dev(form, t16);
    			if (if_block) if_block.m(form, null);
    			append_dev(form, t17);
    			append_dev(form, button);
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(input0, "input", /*input0_input_handler*/ ctx[5]),
    				listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[6]),
    				listen_dev(input1, "change", /*input1_change_handler*/ ctx[7]),
    				listen_dev(form, "submit", prevent_default(/*handleSubmit*/ ctx[2]), false, true, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*input*/ 1 && input0.value !== /*input*/ ctx[0].author.name) {
    				set_input_value(input0, /*input*/ ctx[0].author.name);
    			}

    			if (dirty & /*input*/ 1) {
    				set_input_value(textarea, /*input*/ ctx[0].en);
    			}

    			if (dirty & /*includeRating*/ 2) {
    				input1.checked = /*includeRating*/ ctx[1];
    			}

    			if (/*includeRating*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(form, t17);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div7);
    			if (if_block) if_block.d();
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let input;
    	let includeRating = false;
    	resetInput();

    	async function handleSubmit(event) {
    		await fetch("http://localhost:3000/api/quotes", {
    			method: "POST",
    			headers: { "Content-Type": "application/json" },
    			body: JSON.stringify(input)
    		});

    		resetForm();
    	}

    	function resetInput() {
    		$$invalidate(0, input = { en: "", author: { name: "" } });
    	}

    	function resetForm() {
    		resetInput();
    		$$invalidate(1, includeRating = false);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<AddQuote> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("AddQuote", $$slots, []);

    	function input0_input_handler() {
    		input.author.name = this.value;
    		($$invalidate(0, input), $$invalidate(1, includeRating));
    	}

    	function textarea_input_handler() {
    		input.en = this.value;
    		($$invalidate(0, input), $$invalidate(1, includeRating));
    	}

    	function input1_change_handler() {
    		includeRating = this.checked;
    		$$invalidate(1, includeRating);
    	}

    	function input_1_change_input_handler() {
    		input.rating = to_number(this.value);
    		($$invalidate(0, input), $$invalidate(1, includeRating));
    	}

    	$$self.$capture_state = () => ({
    		input,
    		includeRating,
    		handleSubmit,
    		resetInput,
    		resetForm
    	});

    	$$self.$inject_state = $$props => {
    		if ("input" in $$props) $$invalidate(0, input = $$props.input);
    		if ("includeRating" in $$props) $$invalidate(1, includeRating = $$props.includeRating);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*includeRating*/ 2) {
    			 {
    				includeRating
    				? $$invalidate(0, input.rating = 0, input)
    				: $$invalidate(0, input.rating = null, input);
    			}
    		}
    	};

    	return [
    		input,
    		includeRating,
    		handleSubmit,
    		resetInput,
    		resetForm,
    		input0_input_handler,
    		textarea_input_handler,
    		input1_change_handler,
    		input_1_change_input_handler
    	];
    }

    class AddQuote extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AddQuote",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\client\components\LanguageDropdown.svelte generated by Svelte v3.20.1 */

    const file$2 = "src\\client\\components\\LanguageDropdown.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (9:8) {#each languages as lang}
    function create_each_block(ctx) {
    	let option;
    	let t_value = /*lang*/ ctx[3].label + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*lang*/ ctx[3].code;
    			option.value = option.__value;
    			add_location(option, file$2, 9, 12, 202);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*languages*/ 2 && t_value !== (t_value = /*lang*/ ctx[3].label + "")) set_data_dev(t, t_value);

    			if (dirty & /*languages*/ 2 && option_value_value !== (option_value_value = /*lang*/ ctx[3].code)) {
    				prop_dev(option, "__value", option_value_value);
    			}

    			option.value = option.__value;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(9:8) {#each languages as lang}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div;
    	let select;
    	let dispose;
    	let each_value = /*languages*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			if (/*selectedLanguage*/ ctx[0] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[2].call(select));
    			add_location(select, file$2, 7, 4, 115);
    			attr_dev(div, "class", "language-dropdown");
    			add_location(div, file$2, 6, 0, 78);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div, anchor);
    			append_dev(div, select);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*selectedLanguage*/ ctx[0]);
    			if (remount) dispose();
    			dispose = listen_dev(select, "change", /*select_change_handler*/ ctx[2]);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*languages*/ 2) {
    				each_value = /*languages*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*selectedLanguage*/ 1) {
    				select_option(select, /*selectedLanguage*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { languages } = $$props;
    	let { selectedLanguage } = $$props;
    	const writable_props = ["languages", "selectedLanguage"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<LanguageDropdown> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("LanguageDropdown", $$slots, []);

    	function select_change_handler() {
    		selectedLanguage = select_value(this);
    		$$invalidate(0, selectedLanguage);
    		$$invalidate(1, languages);
    	}

    	$$self.$set = $$props => {
    		if ("languages" in $$props) $$invalidate(1, languages = $$props.languages);
    		if ("selectedLanguage" in $$props) $$invalidate(0, selectedLanguage = $$props.selectedLanguage);
    	};

    	$$self.$capture_state = () => ({ languages, selectedLanguage });

    	$$self.$inject_state = $$props => {
    		if ("languages" in $$props) $$invalidate(1, languages = $$props.languages);
    		if ("selectedLanguage" in $$props) $$invalidate(0, selectedLanguage = $$props.selectedLanguage);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [selectedLanguage, languages, select_change_handler];
    }

    class LanguageDropdown extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { languages: 1, selectedLanguage: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LanguageDropdown",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*languages*/ ctx[1] === undefined && !("languages" in props)) {
    			console.warn("<LanguageDropdown> was created without expected prop 'languages'");
    		}

    		if (/*selectedLanguage*/ ctx[0] === undefined && !("selectedLanguage" in props)) {
    			console.warn("<LanguageDropdown> was created without expected prop 'selectedLanguage'");
    		}
    	}

    	get languages() {
    		throw new Error("<LanguageDropdown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set languages(value) {
    		throw new Error("<LanguageDropdown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectedLanguage() {
    		throw new Error("<LanguageDropdown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedLanguage(value) {
    		throw new Error("<LanguageDropdown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\client\components\Rating.svelte generated by Svelte v3.20.1 */

    const file$3 = "src\\client\\components\\Rating.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (29:0) {#each determineStars(rating) as star}
    function create_each_block$1(ctx) {
    	let span;
    	let span_class_value;

    	const block = {
    		c: function create() {
    			span = element("span");
    			attr_dev(span, "class", span_class_value = "star fa fa-star" + (!/*star*/ ctx[1].full ? "-half-o" : "") + " " + (/*star*/ ctx[1].checked ? "checked" : "") + " svelte-67m09p");
    			add_location(span, file$3, 29, 1, 459);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*rating*/ 1 && span_class_value !== (span_class_value = "star fa fa-star" + (!/*star*/ ctx[1].full ? "-half-o" : "") + " " + (/*star*/ ctx[1].checked ? "checked" : "") + " svelte-67m09p")) {
    				attr_dev(span, "class", span_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(29:0) {#each determineStars(rating) as star}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let each_1_anchor;
    	let each_value = determineStars(/*rating*/ ctx[0]);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*determineStars, rating*/ 1) {
    				each_value = determineStars(/*rating*/ ctx[0]);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function determineStars(rating) {
    	const ratingRounded = Math.round(rating * 2) / 2;
    	let starArray = [];

    	for (let i = 1; i <= 5; i++) {
    		starArray.push({
    			full: ratingRounded - i !== -0.5,
    			checked: ratingRounded > i - 1
    		});
    	}

    	return starArray;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { rating } = $$props;
    	const writable_props = ["rating"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Rating> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Rating", $$slots, []);

    	$$self.$set = $$props => {
    		if ("rating" in $$props) $$invalidate(0, rating = $$props.rating);
    	};

    	$$self.$capture_state = () => ({ rating, determineStars });

    	$$self.$inject_state = $$props => {
    		if ("rating" in $$props) $$invalidate(0, rating = $$props.rating);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [rating];
    }

    class Rating extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { rating: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Rating",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*rating*/ ctx[0] === undefined && !("rating" in props)) {
    			console.warn("<Rating> was created without expected prop 'rating'");
    		}
    	}

    	get rating() {
    		throw new Error("<Rating>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rating(value) {
    		throw new Error("<Rating>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\client\components\LongText.svelte generated by Svelte v3.20.1 */

    const file$4 = "src\\client\\components\\LongText.svelte";

    // (19:0) {:else}
    function create_else_block$1(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let a;
    	let dispose;

    	const block = {
    		c: function create() {
    			t0 = text("\"");
    			t1 = text(/*textShort*/ ctx[2]);
    			t2 = text("...\"\r\n ");
    			a = element("a");
    			a.textContent = "Show more";
    			attr_dev(a, "href", "/");
    			add_location(a, file$4, 20, 1, 383);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, a, anchor);
    			if (remount) dispose();
    			dispose = listen_dev(a, "click", prevent_default(/*toggleExpanded*/ ctx[3]), false, true, false);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*textShort*/ 4) set_data_dev(t1, /*textShort*/ ctx[2]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(a);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(19:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (16:19) 
    function create_if_block_1$1(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let a;
    	let dispose;

    	const block = {
    		c: function create() {
    			t0 = text("\"");
    			t1 = text(/*text*/ ctx[1]);
    			t2 = text("\"\r\n\t");
    			a = element("a");
    			a.textContent = "Show less";
    			attr_dev(a, "href", "/");
    			add_location(a, file$4, 17, 1, 286);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, a, anchor);
    			if (remount) dispose();
    			dispose = listen_dev(a, "click", prevent_default(/*toggleExpanded*/ ctx[3]), false, true, false);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*text*/ 2) set_data_dev(t1, /*text*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(a);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(16:19) ",
    		ctx
    	});

    	return block;
    }

    // (14:0) {#if text === textShort}
    function create_if_block$2(ctx) {
    	let t0;
    	let t1;
    	let t2;

    	const block = {
    		c: function create() {
    			t0 = text("\"");
    			t1 = text(/*text*/ ctx[1]);
    			t2 = text("\"");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, t2, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*text*/ 2) set_data_dev(t1, /*text*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(t2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(14:0) {#if text === textShort}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*text*/ ctx[1] === /*textShort*/ ctx[2]) return create_if_block$2;
    		if (/*expanded*/ ctx[0]) return create_if_block_1$1;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { text } = $$props;
    	let { expanded = false } = $$props;
    	let { wordLimit = 25 } = $$props;

    	function toggleExpanded() {
    		$$invalidate(0, expanded = !expanded);
    	}

    	const writable_props = ["text", "expanded", "wordLimit"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<LongText> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("LongText", $$slots, []);

    	$$self.$set = $$props => {
    		if ("text" in $$props) $$invalidate(1, text = $$props.text);
    		if ("expanded" in $$props) $$invalidate(0, expanded = $$props.expanded);
    		if ("wordLimit" in $$props) $$invalidate(4, wordLimit = $$props.wordLimit);
    	};

    	$$self.$capture_state = () => ({
    		text,
    		expanded,
    		wordLimit,
    		toggleExpanded,
    		textShort
    	});

    	$$self.$inject_state = $$props => {
    		if ("text" in $$props) $$invalidate(1, text = $$props.text);
    		if ("expanded" in $$props) $$invalidate(0, expanded = $$props.expanded);
    		if ("wordLimit" in $$props) $$invalidate(4, wordLimit = $$props.wordLimit);
    		if ("textShort" in $$props) $$invalidate(2, textShort = $$props.textShort);
    	};

    	let textShort;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*text, wordLimit*/ 18) {
    			 $$invalidate(2, textShort = text.split(" ").slice(0, wordLimit).join(" "));
    		}
    	};

    	return [expanded, text, textShort, toggleExpanded, wordLimit];
    }

    class LongText extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { text: 1, expanded: 0, wordLimit: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LongText",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*text*/ ctx[1] === undefined && !("text" in props)) {
    			console.warn("<LongText> was created without expected prop 'text'");
    		}
    	}

    	get text() {
    		throw new Error("<LongText>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<LongText>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get expanded() {
    		throw new Error("<LongText>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set expanded(value) {
    		throw new Error("<LongText>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get wordLimit() {
    		throw new Error("<LongText>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set wordLimit(value) {
    		throw new Error("<LongText>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\client\components\Quote.svelte generated by Svelte v3.20.1 */

    const { console: console_1 } = globals;
    const file$5 = "src\\client\\components\\Quote.svelte";

    // (57:1) {#if quote.rating !== null }
    function create_if_block$3(ctx) {
    	let div;
    	let current;

    	const rating = new Rating({
    			props: { rating: /*quote*/ ctx[0].rating },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(rating.$$.fragment);
    			attr_dev(div, "class", "rating svelte-v0pc81");
    			add_location(div, file$5, 57, 2, 935);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(rating, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const rating_changes = {};
    			if (dirty & /*quote*/ 1) rating_changes.rating = /*quote*/ ctx[0].rating;
    			rating.$set(rating_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(rating.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(rating.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(rating);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(57:1) {#if quote.rating !== null }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let div2;
    	let div0;
    	let t0_value = /*quote*/ ctx[0].author.name + "";
    	let t0;
    	let t1;
    	let div1;
    	let t2;
    	let t3;
    	let a;
    	let i;
    	let div2_id_value;
    	let current;
    	let dispose;

    	const longtext = new LongText({
    			props: {
    				text: /*quote*/ ctx[0][/*selectedLanguage*/ ctx[1]],
    				expanded: /*expanded*/ ctx[2]
    			},
    			$$inline: true
    		});

    	let if_block = /*quote*/ ctx[0].rating !== null && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			div1 = element("div");
    			create_component(longtext.$$.fragment);
    			t2 = space();
    			if (if_block) if_block.c();
    			t3 = space();
    			a = element("a");
    			i = element("i");
    			attr_dev(div0, "class", "author svelte-v0pc81");
    			add_location(div0, file$5, 48, 1, 744);
    			attr_dev(div1, "class", "quote-contents svelte-v0pc81");
    			add_location(div1, file$5, 52, 1, 802);
    			attr_dev(i, "class", "fa fa-trash");
    			add_location(i, file$5, 62, 51, 1067);
    			attr_dev(a, "href", "/");
    			add_location(a, file$5, 62, 1, 1017);
    			attr_dev(div2, "class", "quote svelte-v0pc81");
    			attr_dev(div2, "id", div2_id_value = /*quote*/ ctx[0].id);
    			add_location(div2, file$5, 46, 0, 705);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, t0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			mount_component(longtext, div1, null);
    			append_dev(div2, t2);
    			if (if_block) if_block.m(div2, null);
    			append_dev(div2, t3);
    			append_dev(div2, a);
    			append_dev(a, i);
    			current = true;
    			if (remount) dispose();
    			dispose = listen_dev(a, "click", prevent_default(/*deleteQuote*/ ctx[3]), false, true, false);
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*quote*/ 1) && t0_value !== (t0_value = /*quote*/ ctx[0].author.name + "")) set_data_dev(t0, t0_value);
    			const longtext_changes = {};
    			if (dirty & /*quote, selectedLanguage*/ 3) longtext_changes.text = /*quote*/ ctx[0][/*selectedLanguage*/ ctx[1]];
    			if (dirty & /*expanded*/ 4) longtext_changes.expanded = /*expanded*/ ctx[2];
    			longtext.$set(longtext_changes);

    			if (/*quote*/ ctx[0].rating !== null) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div2, t3);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*quote*/ 1 && div2_id_value !== (div2_id_value = /*quote*/ ctx[0].id)) {
    				attr_dev(div2, "id", div2_id_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(longtext.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(longtext.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(longtext);
    			if (if_block) if_block.d();
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { quote } = $$props;
    	let { selectedLanguage } = $$props;
    	let { expanded } = $$props;
    	let { onQuoteDelete } = $$props;

    	async function deleteQuote() {
    		try {
    			await fetch(`http://localhost:3000/api/quotes/${quote.id}`, { method: "DELETE" });
    			onQuoteDelete(quote.id);
    		} catch(error) {
    			console.log(error);
    		}
    	}

    	const writable_props = ["quote", "selectedLanguage", "expanded", "onQuoteDelete"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Quote> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Quote", $$slots, []);

    	$$self.$set = $$props => {
    		if ("quote" in $$props) $$invalidate(0, quote = $$props.quote);
    		if ("selectedLanguage" in $$props) $$invalidate(1, selectedLanguage = $$props.selectedLanguage);
    		if ("expanded" in $$props) $$invalidate(2, expanded = $$props.expanded);
    		if ("onQuoteDelete" in $$props) $$invalidate(4, onQuoteDelete = $$props.onQuoteDelete);
    	};

    	$$self.$capture_state = () => ({
    		quote,
    		selectedLanguage,
    		expanded,
    		onQuoteDelete,
    		Rating,
    		LongText,
    		deleteQuote
    	});

    	$$self.$inject_state = $$props => {
    		if ("quote" in $$props) $$invalidate(0, quote = $$props.quote);
    		if ("selectedLanguage" in $$props) $$invalidate(1, selectedLanguage = $$props.selectedLanguage);
    		if ("expanded" in $$props) $$invalidate(2, expanded = $$props.expanded);
    		if ("onQuoteDelete" in $$props) $$invalidate(4, onQuoteDelete = $$props.onQuoteDelete);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [quote, selectedLanguage, expanded, deleteQuote, onQuoteDelete];
    }

    class Quote extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {
    			quote: 0,
    			selectedLanguage: 1,
    			expanded: 2,
    			onQuoteDelete: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Quote",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*quote*/ ctx[0] === undefined && !("quote" in props)) {
    			console_1.warn("<Quote> was created without expected prop 'quote'");
    		}

    		if (/*selectedLanguage*/ ctx[1] === undefined && !("selectedLanguage" in props)) {
    			console_1.warn("<Quote> was created without expected prop 'selectedLanguage'");
    		}

    		if (/*expanded*/ ctx[2] === undefined && !("expanded" in props)) {
    			console_1.warn("<Quote> was created without expected prop 'expanded'");
    		}

    		if (/*onQuoteDelete*/ ctx[4] === undefined && !("onQuoteDelete" in props)) {
    			console_1.warn("<Quote> was created without expected prop 'onQuoteDelete'");
    		}
    	}

    	get quote() {
    		throw new Error("<Quote>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set quote(value) {
    		throw new Error("<Quote>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectedLanguage() {
    		throw new Error("<Quote>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedLanguage(value) {
    		throw new Error("<Quote>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get expanded() {
    		throw new Error("<Quote>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set expanded(value) {
    		throw new Error("<Quote>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onQuoteDelete() {
    		throw new Error("<Quote>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onQuoteDelete(value) {
    		throw new Error("<Quote>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\client\components\Search.svelte generated by Svelte v3.20.1 */

    const file$6 = "src\\client\\components\\Search.svelte";

    function create_fragment$8(ctx) {
    	let input;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "class", "form-control mr-sm-2");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", "Search");
    			add_location(input, file$6, 4, 0, 46);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*search*/ ctx[0]);
    			if (remount) dispose();
    			dispose = listen_dev(input, "input", /*input_input_handler*/ ctx[1]);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*search*/ 1 && input.value !== /*search*/ ctx[0]) {
    				set_input_value(input, /*search*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { search = "" } = $$props;
    	const writable_props = ["search"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Search> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Search", $$slots, []);

    	function input_input_handler() {
    		search = this.value;
    		$$invalidate(0, search);
    	}

    	$$self.$set = $$props => {
    		if ("search" in $$props) $$invalidate(0, search = $$props.search);
    	};

    	$$self.$capture_state = () => ({ search });

    	$$self.$inject_state = $$props => {
    		if ("search" in $$props) $$invalidate(0, search = $$props.search);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [search, input_input_handler];
    }

    class Search extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { search: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Search",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get search() {
    		throw new Error("<Search>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set search(value) {
    		throw new Error("<Search>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\client\routes\Home.svelte generated by Svelte v3.20.1 */

    const { console: console_1$1 } = globals;
    const file$7 = "src\\client\\routes\\Home.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[19] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[22] = list[i];
    	return child_ctx;
    }

    // (107:12) {#each authors as author}
    function create_each_block_1(ctx) {
    	let div;
    	let label;
    	let input;
    	let input_value_value;
    	let t0;
    	let t1_value = /*author*/ ctx[22] + "";
    	let t1;
    	let t2;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			label = element("label");
    			input = element("input");
    			t0 = space();
    			t1 = text(t1_value);
    			t2 = space();
    			attr_dev(input, "type", "checkbox");
    			attr_dev(input, "class", "form-check-input");
    			input.__value = input_value_value = /*author*/ ctx[22];
    			input.value = input.__value;
    			/*$$binding_groups*/ ctx[16][0].push(input);
    			add_location(input, file$7, 109, 20, 2555);
    			attr_dev(label, "class", "form-check-label");
    			add_location(label, file$7, 108, 16, 2501);
    			attr_dev(div, "class", "form-check");
    			add_location(div, file$7, 107, 12, 2459);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div, anchor);
    			append_dev(div, label);
    			append_dev(label, input);
    			input.checked = ~/*selectedAuthors*/ ctx[4].indexOf(input.__value);
    			append_dev(label, t0);
    			append_dev(label, t1);
    			append_dev(div, t2);
    			if (remount) dispose();
    			dispose = listen_dev(input, "change", /*input_change_handler*/ ctx[15]);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*authors*/ 8 && input_value_value !== (input_value_value = /*author*/ ctx[22])) {
    				prop_dev(input, "__value", input_value_value);
    			}

    			input.value = input.__value;

    			if (dirty & /*selectedAuthors*/ 16) {
    				input.checked = ~/*selectedAuthors*/ ctx[4].indexOf(input.__value);
    			}

    			if (dirty & /*authors*/ 8 && t1_value !== (t1_value = /*author*/ ctx[22] + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			/*$$binding_groups*/ ctx[16][0].splice(/*$$binding_groups*/ ctx[16][0].indexOf(input), 1);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(107:12) {#each authors as author}",
    		ctx
    	});

    	return block;
    }

    // (130:4) {#each quotesFiltered as quote (quote.id)}
    function create_each_block$2(key_1, ctx) {
    	let first;
    	let current;

    	const quote = new Quote({
    			props: {
    				quote: /*quote*/ ctx[19],
    				selectedLanguage: /*selectedLanguage*/ ctx[1],
    				expanded: /*expanded*/ ctx[2],
    				onQuoteDelete: /*onQuoteDelete*/ ctx[7]
    			},
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			create_component(quote.$$.fragment);
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(quote, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const quote_changes = {};
    			if (dirty & /*quotesFiltered*/ 1) quote_changes.quote = /*quote*/ ctx[19];
    			if (dirty & /*selectedLanguage*/ 2) quote_changes.selectedLanguage = /*selectedLanguage*/ ctx[1];
    			if (dirty & /*expanded*/ 4) quote_changes.expanded = /*expanded*/ ctx[2];
    			quote.$set(quote_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(quote.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(quote.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			destroy_component(quote, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(130:4) {#each quotesFiltered as quote (quote.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let div2;
    	let form;
    	let updating_search;
    	let t0;
    	let div1;
    	let button;
    	let t2;
    	let div0;
    	let t3;
    	let select;
    	let option0;
    	let option0_value_value;
    	let option1;
    	let option1_value_value;
    	let t6;
    	let updating_selectedLanguage;
    	let t7;
    	let div3;
    	let each_blocks = [];
    	let each1_lookup = new Map();
    	let current;
    	let dispose;

    	function search_1_search_binding(value) {
    		/*search_1_search_binding*/ ctx[14].call(null, value);
    	}

    	let search_1_props = {};

    	if (/*search*/ ctx[5] !== void 0) {
    		search_1_props.search = /*search*/ ctx[5];
    	}

    	const search_1 = new Search({ props: search_1_props, $$inline: true });
    	binding_callbacks.push(() => bind(search_1, "search", search_1_search_binding));
    	let each_value_1 = /*authors*/ ctx[3];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	function languagedropdown_selectedLanguage_binding(value) {
    		/*languagedropdown_selectedLanguage_binding*/ ctx[18].call(null, value);
    	}

    	let languagedropdown_props = { languages: /*languages*/ ctx[6] };

    	if (/*selectedLanguage*/ ctx[1] !== void 0) {
    		languagedropdown_props.selectedLanguage = /*selectedLanguage*/ ctx[1];
    	}

    	const languagedropdown = new LanguageDropdown({
    			props: languagedropdown_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(languagedropdown, "selectedLanguage", languagedropdown_selectedLanguage_binding));
    	let each_value = /*quotesFiltered*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*quote*/ ctx[19].id;
    	validate_each_keys(ctx, each_value, get_each_context$2, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$2(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each1_lookup.set(key, each_blocks[i] = create_each_block$2(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			form = element("form");
    			create_component(search_1.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			button = element("button");
    			button.textContent = "Authors";
    			t2 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t3 = space();
    			select = element("select");
    			option0 = element("option");
    			option0.textContent = "Expand All";
    			option1 = element("option");
    			option1.textContent = "Collapse All";
    			t6 = space();
    			create_component(languagedropdown.$$.fragment);
    			t7 = space();
    			div3 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(form, "class", "form-inline");
    			add_location(form, file$7, 96, 4, 2067);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "btn btn-outline-secondary dropdown-toggle white-background svelte-tyhnnh");
    			attr_dev(button, "data-toggle", "dropdown");
    			add_location(button, file$7, 102, 8, 2217);
    			attr_dev(div0, "class", "dropdown-menu p-1");
    			add_location(div0, file$7, 105, 8, 2375);
    			attr_dev(div1, "class", "dropdown");
    			add_location(div1, file$7, 101, 4, 2185);
    			option0.__value = option0_value_value = true;
    			option0.value = option0.__value;
    			add_location(option0, file$7, 119, 8, 2855);
    			option1.__value = option1_value_value = false;
    			option1.value = option1.__value;
    			add_location(option1, file$7, 120, 8, 2906);
    			if (/*expanded*/ ctx[2] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[17].call(select));
    			add_location(select, file$7, 118, 4, 2815);
    			attr_dev(div2, "class", "filter-bar d-flex justify-content-between p-2 svelte-tyhnnh");
    			add_location(div2, file$7, 93, 0, 1975);
    			attr_dev(div3, "class", "quotes");
    			add_location(div3, file$7, 128, 0, 3072);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, form);
    			mount_component(search_1, form, null);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, button);
    			append_dev(div1, t2);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div0, null);
    			}

    			append_dev(div2, t3);
    			append_dev(div2, select);
    			append_dev(select, option0);
    			append_dev(select, option1);
    			select_option(select, /*expanded*/ ctx[2]);
    			append_dev(div2, t6);
    			mount_component(languagedropdown, div2, null);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, div3, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div3, null);
    			}

    			current = true;
    			if (remount) dispose();
    			dispose = listen_dev(select, "change", /*select_change_handler*/ ctx[17]);
    		},
    		p: function update(ctx, [dirty]) {
    			const search_1_changes = {};

    			if (!updating_search && dirty & /*search*/ 32) {
    				updating_search = true;
    				search_1_changes.search = /*search*/ ctx[5];
    				add_flush_callback(() => updating_search = false);
    			}

    			search_1.$set(search_1_changes);

    			if (dirty & /*authors, selectedAuthors*/ 24) {
    				each_value_1 = /*authors*/ ctx[3];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*expanded*/ 4) {
    				select_option(select, /*expanded*/ ctx[2]);
    			}

    			const languagedropdown_changes = {};

    			if (!updating_selectedLanguage && dirty & /*selectedLanguage*/ 2) {
    				updating_selectedLanguage = true;
    				languagedropdown_changes.selectedLanguage = /*selectedLanguage*/ ctx[1];
    				add_flush_callback(() => updating_selectedLanguage = false);
    			}

    			languagedropdown.$set(languagedropdown_changes);

    			if (dirty & /*quotesFiltered, selectedLanguage, expanded, onQuoteDelete*/ 135) {
    				const each_value = /*quotesFiltered*/ ctx[0];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$2, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each1_lookup, div3, outro_and_destroy_block, create_each_block$2, null, get_each_context$2);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(search_1.$$.fragment, local);
    			transition_in(languagedropdown.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(search_1.$$.fragment, local);
    			transition_out(languagedropdown.$$.fragment, local);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(search_1);
    			destroy_each(each_blocks_1, detaching);
    			destroy_component(languagedropdown);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(div3);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const url = "http://localhost:3000/api/quotes";

    function getAuthors(quotes) {
    	let authors = [];

    	for (let i = 0; i < quotes.length; i++) {
    		if (authors.includes(quotes[i].author.name)) {
    			continue;
    		} else {
    			authors.push(quotes[i].author.name);
    		}
    	}

    	return authors.sort();
    }

    function instance$9($$self, $$props, $$invalidate) {
    	const languages = [{ code: "en", label: "English" }, { code: "gib", label: "Gibberish" }];
    	let quotes = [];
    	let quotesFiltered = [];
    	let selectedLanguage = "en";
    	let expanded = false;
    	let authors = [];
    	let selectedAuthors = [];
    	let search;
    	getQuotes();

    	async function getQuotes() {
    		try {
    			const res = await fetch(url);
    			$$invalidate(8, quotes = await res.json());
    			$$invalidate(3, authors = getAuthors(quotes));
    		} catch(error) {
    			console.log(error);
    		}
    	}

    	function authorFilter(quote) {
    		if (selectedAuthors.length > 0) {
    			return selectedAuthors.includes(quote.author.name);
    		}

    		return true;
    	}

    	function searchFilter(quote) {
    		if (search) {
    			let searchInput = search.toLowerCase();
    			return quote.author.name.toLowerCase().includes(searchInput) || quote[selectedLanguage].toLowerCase().includes(searchInput);
    		}

    		return true;
    	}

    	function quoteMeetsFilters(quote) {
    		return searchFilter(quote) && authorFilter(quote);
    	}

    	function setQuotesFiltered() {
    		$$invalidate(0, quotesFiltered = quotes.filter(quoteMeetsFilters));
    	}

    	async function onQuoteDelete(id) {
    		alert("Quote deleted!");
    		await getQuotes();
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Home", $$slots, []);
    	const $$binding_groups = [[]];

    	function search_1_search_binding(value) {
    		search = value;
    		$$invalidate(5, search);
    	}

    	function input_change_handler() {
    		selectedAuthors = get_binding_group_value($$binding_groups[0]);
    		$$invalidate(4, selectedAuthors);
    	}

    	function select_change_handler() {
    		expanded = select_value(this);
    		$$invalidate(2, expanded);
    	}

    	function languagedropdown_selectedLanguage_binding(value) {
    		selectedLanguage = value;
    		$$invalidate(1, selectedLanguage);
    	}

    	$$self.$capture_state = () => ({
    		LanguageDropdown,
    		Quote,
    		Search,
    		url,
    		languages,
    		quotes,
    		quotesFiltered,
    		selectedLanguage,
    		expanded,
    		authors,
    		selectedAuthors,
    		search,
    		getQuotes,
    		getAuthors,
    		authorFilter,
    		searchFilter,
    		quoteMeetsFilters,
    		setQuotesFiltered,
    		onQuoteDelete
    	});

    	$$self.$inject_state = $$props => {
    		if ("quotes" in $$props) $$invalidate(8, quotes = $$props.quotes);
    		if ("quotesFiltered" in $$props) $$invalidate(0, quotesFiltered = $$props.quotesFiltered);
    		if ("selectedLanguage" in $$props) $$invalidate(1, selectedLanguage = $$props.selectedLanguage);
    		if ("expanded" in $$props) $$invalidate(2, expanded = $$props.expanded);
    		if ("authors" in $$props) $$invalidate(3, authors = $$props.authors);
    		if ("selectedAuthors" in $$props) $$invalidate(4, selectedAuthors = $$props.selectedAuthors);
    		if ("search" in $$props) $$invalidate(5, search = $$props.search);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*quotes, search, selectedAuthors, selectedLanguage*/ 306) {
    			 (setQuotesFiltered());
    		}
    	};

    	return [
    		quotesFiltered,
    		selectedLanguage,
    		expanded,
    		authors,
    		selectedAuthors,
    		search,
    		languages,
    		onQuoteDelete,
    		quotes,
    		getQuotes,
    		authorFilter,
    		searchFilter,
    		quoteMeetsFilters,
    		setQuotesFiltered,
    		search_1_search_binding,
    		input_change_handler,
    		$$binding_groups,
    		select_change_handler,
    		languagedropdown_selectedLanguage_binding
    	];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src\client\components\NavBar.svelte generated by Svelte v3.20.1 */

    const file$8 = "src\\client\\components\\NavBar.svelte";

    function create_fragment$a(ctx) {
    	let nav;
    	let a0;
    	let t1;
    	let a1;
    	let t3;
    	let a2;
    	let t5;
    	let a3;
    	let t7;
    	let a4;

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			a0 = element("a");
    			a0.textContent = "Dashboard";
    			t1 = space();
    			a1 = element("a");
    			a1.textContent = "Add Quote";
    			t3 = space();
    			a2 = element("a");
    			a2.textContent = "Explore Authors";
    			t5 = space();
    			a3 = element("a");
    			a3.textContent = "Link 4";
    			t7 = space();
    			a4 = element("a");
    			a4.textContent = "Link 5";
    			attr_dev(a0, "href", "/");
    			attr_dev(a0, "class", "p-2 text-muted");
    			add_location(a0, file$8, 12, 4, 151);
    			attr_dev(a1, "href", "/add");
    			attr_dev(a1, "class", "p-2 text-muted");
    			add_location(a1, file$8, 13, 4, 205);
    			attr_dev(a2, "href", "/");
    			attr_dev(a2, "class", "p-2 text-muted");
    			add_location(a2, file$8, 14, 4, 262);
    			attr_dev(a3, "href", "/");
    			attr_dev(a3, "class", "p-2 text-muted");
    			add_location(a3, file$8, 15, 4, 322);
    			attr_dev(a4, "href", "/");
    			attr_dev(a4, "class", "p-2 text-muted");
    			add_location(a4, file$8, 16, 4, 373);
    			attr_dev(nav, "class", "nav d-flex justify-content-between svelte-esdlen");
    			add_location(nav, file$8, 11, 0, 97);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, a0);
    			append_dev(nav, t1);
    			append_dev(nav, a1);
    			append_dev(nav, t3);
    			append_dev(nav, a2);
    			append_dev(nav, t5);
    			append_dev(nav, a3);
    			append_dev(nav, t7);
    			append_dev(nav, a4);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<NavBar> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("NavBar", $$slots, []);
    	return [];
    }

    class NavBar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NavBar",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src\client\components\PageHeader.svelte generated by Svelte v3.20.1 */

    const file$9 = "src\\client\\components\\PageHeader.svelte";

    function create_fragment$b(ctx) {
    	let header;
    	let div3;
    	let div0;
    	let a0;
    	let t1;
    	let div1;
    	let a1;
    	let t3;
    	let div2;
    	let a2;

    	const block = {
    		c: function create() {
    			header = element("header");
    			div3 = element("div");
    			div0 = element("div");
    			a0 = element("a");
    			a0.textContent = "Do something 1";
    			t1 = space();
    			div1 = element("div");
    			a1 = element("a");
    			a1.textContent = "Quotes";
    			t3 = space();
    			div2 = element("div");
    			a2 = element("a");
    			a2.textContent = "Sign Up";
    			attr_dev(a0, "href", "/");
    			attr_dev(a0, "class", "text-muted");
    			add_location(a0, file$9, 19, 12, 387);
    			attr_dev(div0, "class", "col-4");
    			add_location(div0, file$9, 18, 8, 354);
    			attr_dev(a1, "href", "/");
    			attr_dev(a1, "class", "text-dark");
    			add_location(a1, file$9, 22, 12, 541);
    			attr_dev(div1, "class", "col-4 text-center page-header-title svelte-1lp3vqv");
    			attr_dev(div1, "id", "page-title");
    			add_location(div1, file$9, 21, 8, 462);
    			attr_dev(a2, "href", "/");
    			attr_dev(a2, "class", "text-muted");
    			add_location(a2, file$9, 25, 12, 651);
    			attr_dev(div2, "class", "col-4 text-right");
    			add_location(div2, file$9, 24, 8, 607);
    			attr_dev(div3, "class", "row d-flex align-items-center header-content");
    			add_location(div3, file$9, 17, 4, 286);
    			attr_dev(header, "class", "page-header svelte-1lp3vqv");
    			add_location(header, file$9, 16, 0, 252);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, div3);
    			append_dev(div3, div0);
    			append_dev(div0, a0);
    			append_dev(div3, t1);
    			append_dev(div3, div1);
    			append_dev(div1, a1);
    			append_dev(div3, t3);
    			append_dev(div3, div2);
    			append_dev(div2, a2);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<PageHeader> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("PageHeader", $$slots, []);
    	return [];
    }

    class PageHeader extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PageHeader",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src\client\App.svelte generated by Svelte v3.20.1 */
    const file$a = "src\\client\\App.svelte";

    // (44:2) <Route path="/">
    function create_default_slot_2(ctx) {
    	let current;
    	const home = new Home({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(home.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(home, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(home.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(home.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(home, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(44:2) <Route path=\\\"/\\\">",
    		ctx
    	});

    	return block;
    }

    // (46:2) <Route path="add">
    function create_default_slot_1(ctx) {
    	let current;
    	const addquote = new AddQuote({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(addquote.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(addquote, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(addquote.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(addquote.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(addquote, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(46:2) <Route path=\\\"add\\\">",
    		ctx
    	});

    	return block;
    }

    // (37:0) <Router>
    function create_default_slot(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let t2;
    	let current;
    	const pageheader = new PageHeader({ $$inline: true });
    	const navbar = new NavBar({ $$inline: true });

    	const route0 = new Route({
    			props: {
    				path: "/",
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const route1 = new Route({
    			props: {
    				path: "add",
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(pageheader.$$.fragment);
    			t0 = space();
    			create_component(navbar.$$.fragment);
    			t1 = space();
    			create_component(route0.$$.fragment);
    			t2 = space();
    			create_component(route1.$$.fragment);
    			attr_dev(div, "class", "container");
    			add_location(div, file$a, 37, 1, 1047);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(pageheader, div, null);
    			append_dev(div, t0);
    			mount_component(navbar, div, null);
    			append_dev(div, t1);
    			mount_component(route0, div, null);
    			append_dev(div, t2);
    			mount_component(route1, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const route0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				route0_changes.$$scope = { dirty, ctx };
    			}

    			route0.$set(route0_changes);
    			const route1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				route1_changes.$$scope = { dirty, ctx };
    			}

    			route1.$set(route1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(pageheader.$$.fragment, local);
    			transition_in(navbar.$$.fragment, local);
    			transition_in(route0.$$.fragment, local);
    			transition_in(route1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(pageheader.$$.fragment, local);
    			transition_out(navbar.$$.fragment, local);
    			transition_out(route0.$$.fragment, local);
    			transition_out(route1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(pageheader);
    			destroy_component(navbar);
    			destroy_component(route0);
    			destroy_component(route1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(37:0) <Router>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let link0;
    	let link1;
    	let script0;
    	let script0_src_value;
    	let script1;
    	let script1_src_value;
    	let script2;
    	let script2_src_value;
    	let t;
    	let div;
    	let links_action;
    	let current;
    	let dispose;

    	const router = new Router({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			link0 = element("link");
    			link1 = element("link");
    			script0 = element("script");
    			script1 = element("script");
    			script2 = element("script");
    			t = space();
    			div = element("div");
    			create_component(router.$$.fragment);
    			attr_dev(link0, "rel", "stylesheet");
    			attr_dev(link0, "href", "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css");
    			add_location(link0, file$a, 23, 1, 455);
    			attr_dev(link1, "rel", "stylesheet");
    			attr_dev(link1, "href", "https://maxcdn.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css");
    			add_location(link1, file$a, 26, 2, 593);
    			if (script0.src !== (script0_src_value = "https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js")) attr_dev(script0, "src", script0_src_value);
    			add_location(script0, file$a, 27, 2, 696);
    			if (script1.src !== (script1_src_value = "https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.16.0/umd/popper.min.js")) attr_dev(script1, "src", script1_src_value);
    			add_location(script1, file$a, 28, 2, 787);
    			if (script2.src !== (script2_src_value = "https://maxcdn.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.min.js")) attr_dev(script2, "src", script2_src_value);
    			add_location(script2, file$a, 29, 2, 887);
    			document.title = "Quotes";
    			add_location(div, file$a, 35, 0, 1021);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			append_dev(document.head, link0);
    			append_dev(document.head, link1);
    			append_dev(document.head, script0);
    			append_dev(document.head, script1);
    			append_dev(document.head, script2);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div, anchor);
    			mount_component(router, div, null);
    			current = true;
    			if (remount) dispose();
    			dispose = action_destroyer(links_action = links.call(null, div));
    		},
    		p: function update(ctx, [dirty]) {
    			const router_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				router_changes.$$scope = { dirty, ctx };
    			}

    			router.$set(router_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			detach_dev(link0);
    			detach_dev(link1);
    			detach_dev(script0);
    			detach_dev(script1);
    			detach_dev(script2);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div);
    			destroy_component(router);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);

    	$$self.$capture_state = () => ({
    		Router,
    		Link,
    		Route,
    		links,
    		AddQuote,
    		Home,
    		NavBar,
    		PageHeader
    	});

    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    const app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
