
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
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
    function select_options(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            option.selected = ~value.indexOf(option.__value);
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function select_multiple_value(select) {
        return [].map.call(select.querySelectorAll(':checked'), option => option.__value);
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

    /* src\client\AddQuoteForm.svelte generated by Svelte v3.20.1 */

    const file = "src\\client\\AddQuoteForm.svelte";

    function create_fragment(ctx) {
    	let form;
    	let label0;
    	let br;
    	let t1;
    	let input0;
    	let t2;
    	let label1;
    	let t4;
    	let textarea;
    	let t5;
    	let label2;
    	let t7;
    	let span;
    	let t8_value = /*input*/ ctx[0].rating + "";
    	let t8;
    	let t9;
    	let input1;
    	let t10;
    	let button;
    	let dispose;

    	const block = {
    		c: function create() {
    			form = element("form");
    			label0 = element("label");
    			label0.textContent = "First name:";
    			br = element("br");
    			t1 = space();
    			input0 = element("input");
    			t2 = space();
    			label1 = element("label");
    			label1.textContent = "Add your quote";
    			t4 = space();
    			textarea = element("textarea");
    			t5 = space();
    			label2 = element("label");
    			label2.textContent = "Rating";
    			t7 = space();
    			span = element("span");
    			t8 = text(t8_value);
    			t9 = space();
    			input1 = element("input");
    			t10 = space();
    			button = element("button");
    			button.textContent = "Add Quote";
    			attr_dev(label0, "for", "author");
    			add_location(label0, file, 26, 2, 525);
    			add_location(br, file, 26, 41, 564);
    			input0.required = true;
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "id", "author");
    			add_location(input0, file, 27, 2, 572);
    			attr_dev(label1, "for", "quote");
    			add_location(label1, file, 29, 2, 649);
    			attr_dev(textarea, "id", "quote");
    			add_location(textarea, file, 30, 2, 694);
    			attr_dev(label2, "for", "rating");
    			add_location(label2, file, 32, 2, 754);
    			add_location(span, file, 33, 2, 792);
    			attr_dev(input1, "type", "range");
    			attr_dev(input1, "id", "rating");
    			attr_dev(input1, "min", "0");
    			attr_dev(input1, "max", "5");
    			attr_dev(input1, "step", "0.5");
    			add_location(input1, file, 33, 30, 820);
    			attr_dev(button, "type", "submit");
    			add_location(button, file, 35, 2, 914);
    			add_location(form, file, 25, 0, 475);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, form, anchor);
    			append_dev(form, label0);
    			append_dev(form, br);
    			append_dev(form, t1);
    			append_dev(form, input0);
    			set_input_value(input0, /*input*/ ctx[0].author.name);
    			append_dev(form, t2);
    			append_dev(form, label1);
    			append_dev(form, t4);
    			append_dev(form, textarea);
    			set_input_value(textarea, /*input*/ ctx[0].en);
    			append_dev(form, t5);
    			append_dev(form, label2);
    			append_dev(form, t7);
    			append_dev(form, span);
    			append_dev(span, t8);
    			append_dev(form, t9);
    			append_dev(form, input1);
    			set_input_value(input1, /*input*/ ctx[0].rating);
    			append_dev(form, t10);
    			append_dev(form, button);
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(input0, "input", /*input0_input_handler*/ ctx[4]),
    				listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[5]),
    				listen_dev(input1, "change", /*input1_change_input_handler*/ ctx[6]),
    				listen_dev(input1, "input", /*input1_change_input_handler*/ ctx[6]),
    				listen_dev(form, "submit", prevent_default(/*handleSubmit*/ ctx[1]), false, true, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*input*/ 1 && input0.value !== /*input*/ ctx[0].author.name) {
    				set_input_value(input0, /*input*/ ctx[0].author.name);
    			}

    			if (dirty & /*input*/ 1) {
    				set_input_value(textarea, /*input*/ ctx[0].en);
    			}

    			if (dirty & /*input*/ 1 && t8_value !== (t8_value = /*input*/ ctx[0].rating + "")) set_data_dev(t8, t8_value);

    			if (dirty & /*input*/ 1) {
    				set_input_value(input1, /*input*/ ctx[0].rating);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form);
    			run_all(dispose);
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
    	let { onQuoteAdded } = $$props;
    	let input;
    	resetInput();

    	async function handleSubmit(event) {
    		await fetch("http://localhost:3000/api/quotes", {
    			method: "POST",
    			headers: { "Content-Type": "application/json" },
    			body: JSON.stringify(input)
    		});

    		onQuoteAdded();
    		resetInput();
    	}

    	function resetInput() {
    		$$invalidate(0, input = { en: "", rating: 0, author: { name: "" } });
    	}

    	const writable_props = ["onQuoteAdded"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<AddQuoteForm> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("AddQuoteForm", $$slots, []);

    	function input0_input_handler() {
    		input.author.name = this.value;
    		$$invalidate(0, input);
    	}

    	function textarea_input_handler() {
    		input.en = this.value;
    		$$invalidate(0, input);
    	}

    	function input1_change_input_handler() {
    		input.rating = to_number(this.value);
    		$$invalidate(0, input);
    	}

    	$$self.$set = $$props => {
    		if ("onQuoteAdded" in $$props) $$invalidate(2, onQuoteAdded = $$props.onQuoteAdded);
    	};

    	$$self.$capture_state = () => ({
    		onQuoteAdded,
    		input,
    		handleSubmit,
    		resetInput
    	});

    	$$self.$inject_state = $$props => {
    		if ("onQuoteAdded" in $$props) $$invalidate(2, onQuoteAdded = $$props.onQuoteAdded);
    		if ("input" in $$props) $$invalidate(0, input = $$props.input);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		input,
    		handleSubmit,
    		onQuoteAdded,
    		resetInput,
    		input0_input_handler,
    		textarea_input_handler,
    		input1_change_input_handler
    	];
    }

    class AddQuoteForm extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { onQuoteAdded: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AddQuoteForm",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*onQuoteAdded*/ ctx[2] === undefined && !("onQuoteAdded" in props)) {
    			console.warn("<AddQuoteForm> was created without expected prop 'onQuoteAdded'");
    		}
    	}

    	get onQuoteAdded() {
    		throw new Error("<AddQuoteForm>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onQuoteAdded(value) {
    		throw new Error("<AddQuoteForm>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\client\Rating.svelte generated by Svelte v3.20.1 */

    const file$1 = "src\\client\\Rating.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (26:0) {#each determineStars(rating) as star}
    function create_each_block(ctx) {
    	let span;
    	let span_class_value;

    	const block = {
    		c: function create() {
    			span = element("span");
    			attr_dev(span, "class", span_class_value = "fa fa-star" + (!/*star*/ ctx[1].full ? "-half-o" : "") + " " + (/*star*/ ctx[1].checked ? "checked" : "") + " svelte-2rrem5");
    			add_location(span, file$1, 26, 1, 442);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*rating*/ 1 && span_class_value !== (span_class_value = "fa fa-star" + (!/*star*/ ctx[1].full ? "-half-o" : "") + " " + (/*star*/ ctx[1].checked ? "checked" : "") + " svelte-2rrem5")) {
    				attr_dev(span, "class", span_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(26:0) {#each determineStars(rating) as star}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let each_1_anchor;
    	let each_value = determineStars(/*rating*/ ctx[0]);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
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
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
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
    		id: create_fragment$1.name,
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

    function instance$1($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { rating: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Rating",
    			options,
    			id: create_fragment$1.name
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

    /* src\client\LongText.svelte generated by Svelte v3.20.1 */

    const file$2 = "src\\client\\LongText.svelte";

    // (19:0) {:else}
    function create_else_block(ctx) {
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
    			add_location(a, file$2, 20, 1, 383);
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
    		id: create_else_block.name,
    		type: "else",
    		source: "(19:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (16:19) 
    function create_if_block_1(ctx) {
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
    			add_location(a, file$2, 17, 1, 286);
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
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(16:19) ",
    		ctx
    	});

    	return block;
    }

    // (14:0) {#if text === textShort}
    function create_if_block(ctx) {
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
    		id: create_if_block.name,
    		type: "if",
    		source: "(14:0) {#if text === textShort}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*text*/ ctx[1] === /*textShort*/ ctx[2]) return create_if_block;
    		if (/*expanded*/ ctx[0]) return create_if_block_1;
    		return create_else_block;
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
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { text: 1, expanded: 0, wordLimit: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LongText",
    			options,
    			id: create_fragment$2.name
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

    /* src\client\Quote.svelte generated by Svelte v3.20.1 */

    const { console: console_1 } = globals;
    const file$3 = "src\\client\\Quote.svelte";

    // (57:1) {#if quote.rating}
    function create_if_block$1(ctx) {
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
    			add_location(div, file$3, 57, 1, 916);
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
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(57:1) {#if quote.rating}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
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
    				text: /*quote*/ ctx[0][/*selectedLang*/ ctx[1]],
    				expanded: /*expanded*/ ctx[2]
    			},
    			$$inline: true
    		});

    	let if_block = /*quote*/ ctx[0].rating && create_if_block$1(ctx);

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
    			add_location(div0, file$3, 48, 1, 740);
    			attr_dev(div1, "class", "quote-contents svelte-v0pc81");
    			add_location(div1, file$3, 52, 1, 798);
    			attr_dev(i, "class", "fa fa-trash");
    			add_location(i, file$3, 62, 51, 1046);
    			attr_dev(a, "href", "/");
    			add_location(a, file$3, 62, 1, 996);
    			attr_dev(div2, "class", "quote svelte-v0pc81");
    			attr_dev(div2, "id", div2_id_value = /*quote*/ ctx[0].id);
    			add_location(div2, file$3, 46, 0, 701);
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
    			if (dirty & /*quote, selectedLang*/ 3) longtext_changes.text = /*quote*/ ctx[0][/*selectedLang*/ ctx[1]];
    			if (dirty & /*expanded*/ 4) longtext_changes.expanded = /*expanded*/ ctx[2];
    			longtext.$set(longtext_changes);

    			if (/*quote*/ ctx[0].rating) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block$1(ctx);
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
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { quote } = $$props;
    	let { selectedLang } = $$props;
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

    	const writable_props = ["quote", "selectedLang", "expanded", "onQuoteDelete"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Quote> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Quote", $$slots, []);

    	$$self.$set = $$props => {
    		if ("quote" in $$props) $$invalidate(0, quote = $$props.quote);
    		if ("selectedLang" in $$props) $$invalidate(1, selectedLang = $$props.selectedLang);
    		if ("expanded" in $$props) $$invalidate(2, expanded = $$props.expanded);
    		if ("onQuoteDelete" in $$props) $$invalidate(4, onQuoteDelete = $$props.onQuoteDelete);
    	};

    	$$self.$capture_state = () => ({
    		quote,
    		selectedLang,
    		expanded,
    		onQuoteDelete,
    		Rating,
    		LongText,
    		deleteQuote
    	});

    	$$self.$inject_state = $$props => {
    		if ("quote" in $$props) $$invalidate(0, quote = $$props.quote);
    		if ("selectedLang" in $$props) $$invalidate(1, selectedLang = $$props.selectedLang);
    		if ("expanded" in $$props) $$invalidate(2, expanded = $$props.expanded);
    		if ("onQuoteDelete" in $$props) $$invalidate(4, onQuoteDelete = $$props.onQuoteDelete);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [quote, selectedLang, expanded, deleteQuote, onQuoteDelete];
    }

    class Quote extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			quote: 0,
    			selectedLang: 1,
    			expanded: 2,
    			onQuoteDelete: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Quote",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*quote*/ ctx[0] === undefined && !("quote" in props)) {
    			console_1.warn("<Quote> was created without expected prop 'quote'");
    		}

    		if (/*selectedLang*/ ctx[1] === undefined && !("selectedLang" in props)) {
    			console_1.warn("<Quote> was created without expected prop 'selectedLang'");
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

    	get selectedLang() {
    		throw new Error("<Quote>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedLang(value) {
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

    /* src\client\Search.svelte generated by Svelte v3.20.1 */

    const file$4 = "src\\client\\Search.svelte";

    function create_fragment$4(ctx) {
    	let input;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			add_location(input, file$4, 4, 0, 46);
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
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { search: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Search",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get search() {
    		throw new Error("<Search>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set search(value) {
    		throw new Error("<Search>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\client\App.svelte generated by Svelte v3.20.1 */

    const { console: console_1$1 } = globals;
    const file$5 = "src\\client\\App.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[19] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[22] = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[25] = list[i];
    	return child_ctx;
    }

    // (109:3) {#each languages as lang}
    function create_each_block_2(ctx) {
    	let option;
    	let t_value = /*lang*/ ctx[25].label + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*lang*/ ctx[25].code;
    			option.value = option.__value;
    			add_location(option, file$5, 109, 4, 2337);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(109:3) {#each languages as lang}",
    		ctx
    	});

    	return block;
    }

    // (122:1) {#each authors as author}
    function create_each_block_1(ctx) {
    	let option;
    	let t_value = /*author*/ ctx[22] + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*author*/ ctx[22];
    			option.value = option.__value;
    			add_location(option, file$5, 122, 2, 2636);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*authors*/ 8 && t_value !== (t_value = /*author*/ ctx[22] + "")) set_data_dev(t, t_value);

    			if (dirty & /*authors*/ 8 && option_value_value !== (option_value_value = /*author*/ ctx[22])) {
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
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(122:1) {#each authors as author}",
    		ctx
    	});

    	return block;
    }

    // (132:1) {#each quotesFiltered as quote (quote.id)}
    function create_each_block$1(key_1, ctx) {
    	let first;
    	let current;

    	const quote = new Quote({
    			props: {
    				quote: /*quote*/ ctx[19],
    				selectedLang: /*selectedLang*/ ctx[1],
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
    			if (dirty & /*selectedLang*/ 2) quote_changes.selectedLang = /*selectedLang*/ ctx[1];
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
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(132:1) {#each quotesFiltered as quote (quote.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let link;
    	let t0;
    	let div2;
    	let div0;
    	let h1;
    	let t2;
    	let div1;
    	let select0;
    	let t3;
    	let select1;
    	let option0;
    	let option0_value_value;
    	let option1;
    	let option1_value_value;
    	let t6;
    	let select2;
    	let t7;
    	let updating_search;
    	let t8;
    	let t9;
    	let div3;
    	let each_blocks = [];
    	let each2_lookup = new Map();
    	let current;
    	let dispose;
    	let each_value_2 = /*languages*/ ctx[6];
    	validate_each_argument(each_value_2);
    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_2[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	let each_value_1 = /*authors*/ ctx[3];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	function search_1_search_binding(value) {
    		/*search_1_search_binding*/ ctx[18].call(null, value);
    	}

    	let search_1_props = {};

    	if (/*search*/ ctx[5] !== void 0) {
    		search_1_props.search = /*search*/ ctx[5];
    	}

    	const search_1 = new Search({ props: search_1_props, $$inline: true });
    	binding_callbacks.push(() => bind(search_1, "search", search_1_search_binding));

    	const addquoteform = new AddQuoteForm({
    			props: { onQuoteAdded: /*onQuoteAdded*/ ctx[8] },
    			$$inline: true
    		});

    	let each_value = /*quotesFiltered*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*quote*/ ctx[19].id;
    	validate_each_keys(ctx, each_value, get_each_context$1, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$1(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each2_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			link = element("link");
    			t0 = space();
    			div2 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Programming quotes";
    			t2 = space();
    			div1 = element("div");
    			select0 = element("select");

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			t3 = space();
    			select1 = element("select");
    			option0 = element("option");
    			option0.textContent = "Expand All";
    			option1 = element("option");
    			option1.textContent = "Collapse All";
    			t6 = space();
    			select2 = element("select");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t7 = space();
    			create_component(search_1.$$.fragment);
    			t8 = space();
    			create_component(addquoteform.$$.fragment);
    			t9 = space();
    			div3 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "href", "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css");
    			add_location(link, file$5, 99, 0, 1989);
    			add_location(h1, file$5, 103, 2, 2180);
    			attr_dev(div0, "id", "page-title");
    			attr_dev(div0, "class", "col-sm-9 svelte-1wnvoju");
    			add_location(div0, file$5, 102, 1, 2139);
    			attr_dev(select0, "class", "svelte-1wnvoju");
    			if (/*selectedLang*/ ctx[1] === void 0) add_render_callback(() => /*select0_change_handler*/ ctx[15].call(select0));
    			add_location(select0, file$5, 107, 2, 2269);
    			attr_dev(div1, "id", "language-dropdown");
    			attr_dev(div1, "class", "col-sm-3 svelte-1wnvoju");
    			add_location(div1, file$5, 106, 1, 2221);
    			attr_dev(div2, "class", "row heading-content svelte-1wnvoju");
    			add_location(div2, file$5, 101, 0, 2104);
    			option0.__value = option0_value_value = true;
    			option0.value = option0.__value;
    			add_location(option0, file$5, 116, 1, 2459);
    			option1.__value = option1_value_value = false;
    			option1.value = option1.__value;
    			add_location(option1, file$5, 117, 1, 2502);
    			attr_dev(select1, "class", "svelte-1wnvoju");
    			if (/*expanded*/ ctx[2] === void 0) add_render_callback(() => /*select1_change_handler*/ ctx[16].call(select1));
    			add_location(select1, file$5, 115, 0, 2427);
    			select2.multiple = true;
    			attr_dev(select2, "class", "svelte-1wnvoju");
    			if (/*selectedAuthors*/ ctx[4] === void 0) add_render_callback(() => /*select2_change_handler*/ ctx[17].call(select2));
    			add_location(select2, file$5, 120, 0, 2560);
    			attr_dev(div3, "class", "quotes");
    			add_location(div3, file$5, 130, 0, 2755);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, link, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, h1);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div1, select0);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(select0, null);
    			}

    			select_option(select0, /*selectedLang*/ ctx[1]);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, select1, anchor);
    			append_dev(select1, option0);
    			append_dev(select1, option1);
    			select_option(select1, /*expanded*/ ctx[2]);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, select2, anchor);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(select2, null);
    			}

    			select_options(select2, /*selectedAuthors*/ ctx[4]);
    			insert_dev(target, t7, anchor);
    			mount_component(search_1, target, anchor);
    			insert_dev(target, t8, anchor);
    			mount_component(addquoteform, target, anchor);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, div3, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div3, null);
    			}

    			current = true;
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(select0, "change", /*select0_change_handler*/ ctx[15]),
    				listen_dev(select1, "change", /*select1_change_handler*/ ctx[16]),
    				listen_dev(select2, "change", /*select2_change_handler*/ ctx[17])
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*languages*/ 64) {
    				each_value_2 = /*languages*/ ctx[6];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks_2[i]) {
    						each_blocks_2[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_2[i] = create_each_block_2(child_ctx);
    						each_blocks_2[i].c();
    						each_blocks_2[i].m(select0, null);
    					}
    				}

    				for (; i < each_blocks_2.length; i += 1) {
    					each_blocks_2[i].d(1);
    				}

    				each_blocks_2.length = each_value_2.length;
    			}

    			if (dirty & /*selectedLang*/ 2) {
    				select_option(select0, /*selectedLang*/ ctx[1]);
    			}

    			if (dirty & /*expanded*/ 4) {
    				select_option(select1, /*expanded*/ ctx[2]);
    			}

    			if (dirty & /*authors*/ 8) {
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
    						each_blocks_1[i].m(select2, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*selectedAuthors*/ 16) {
    				select_options(select2, /*selectedAuthors*/ ctx[4]);
    			}

    			const search_1_changes = {};

    			if (!updating_search && dirty & /*search*/ 32) {
    				updating_search = true;
    				search_1_changes.search = /*search*/ ctx[5];
    				add_flush_callback(() => updating_search = false);
    			}

    			search_1.$set(search_1_changes);

    			if (dirty & /*quotesFiltered, selectedLang, expanded, onQuoteDelete*/ 135) {
    				const each_value = /*quotesFiltered*/ ctx[0];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each2_lookup, div3, outro_and_destroy_block, create_each_block$1, null, get_each_context$1);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(search_1.$$.fragment, local);
    			transition_in(addquoteform.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(search_1.$$.fragment, local);
    			transition_out(addquoteform.$$.fragment, local);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(link);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks_2, detaching);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(select1);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(select2);
    			destroy_each(each_blocks_1, detaching);
    			if (detaching) detach_dev(t7);
    			destroy_component(search_1, detaching);
    			if (detaching) detach_dev(t8);
    			destroy_component(addquoteform, detaching);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(div3);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			run_all(dispose);
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

    	return authors;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	const languages = [{ code: "en", label: "English" }, { code: "gib", label: "Gibberish" }];
    	let quotes = []; // need this to overcome array error for Each block
    	let quotesFiltered = [];
    	let selectedLang;
    	let expanded = false;
    	let authors = [];
    	let selectedAuthors = [];
    	let search;
    	getQuotes();

    	async function getQuotes() {
    		try {
    			const res = await fetch(url);
    			$$invalidate(9, quotes = await res.json());
    			$$invalidate(3, authors = getAuthors(quotes).sort());
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
    			return quote.author.name.toLowerCase().includes(searchInput) || quote[selectedLang].toLowerCase().includes(searchInput);
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

    	async function onQuoteAdded() {
    		alert("your quote has been added!");
    		await getQuotes();
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);

    	function select0_change_handler() {
    		selectedLang = select_value(this);
    		$$invalidate(1, selectedLang);
    		$$invalidate(6, languages);
    	}

    	function select1_change_handler() {
    		expanded = select_value(this);
    		$$invalidate(2, expanded);
    	}

    	function select2_change_handler() {
    		selectedAuthors = select_multiple_value(this);
    		$$invalidate(4, selectedAuthors);
    		$$invalidate(3, authors);
    	}

    	function search_1_search_binding(value) {
    		search = value;
    		$$invalidate(5, search);
    	}

    	$$self.$capture_state = () => ({
    		AddQuoteForm,
    		Quote,
    		Search,
    		url,
    		languages,
    		quotes,
    		quotesFiltered,
    		selectedLang,
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
    		onQuoteDelete,
    		onQuoteAdded
    	});

    	$$self.$inject_state = $$props => {
    		if ("quotes" in $$props) $$invalidate(9, quotes = $$props.quotes);
    		if ("quotesFiltered" in $$props) $$invalidate(0, quotesFiltered = $$props.quotesFiltered);
    		if ("selectedLang" in $$props) $$invalidate(1, selectedLang = $$props.selectedLang);
    		if ("expanded" in $$props) $$invalidate(2, expanded = $$props.expanded);
    		if ("authors" in $$props) $$invalidate(3, authors = $$props.authors);
    		if ("selectedAuthors" in $$props) $$invalidate(4, selectedAuthors = $$props.selectedAuthors);
    		if ("search" in $$props) $$invalidate(5, search = $$props.search);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*quotes, search, selectedAuthors, selectedLang*/ 562) {
    			 (setQuotesFiltered());
    		}
    	};

    	return [
    		quotesFiltered,
    		selectedLang,
    		expanded,
    		authors,
    		selectedAuthors,
    		search,
    		languages,
    		onQuoteDelete,
    		onQuoteAdded,
    		quotes,
    		getQuotes,
    		authorFilter,
    		searchFilter,
    		quoteMeetsFilters,
    		setQuotesFiltered,
    		select0_change_handler,
    		select1_change_handler,
    		select2_change_handler,
    		search_1_search_binding
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
