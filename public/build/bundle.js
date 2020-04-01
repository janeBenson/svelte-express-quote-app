(function (l, r) {
  if (l.getElementById("livereloadscript")) return;
  r = l.createElement("script");
  r.async = 1;
  r.src =
    "//" +
    (window.location.host || "localhost").split(":")[0] +
    ":35729/livereload.js?snipver=1";
  r.id = "livereloadscript";
  l.head.appendChild(r);
})(window.document);
var app = (function () {
  "use strict";

  function noop() {}
  const identity = (x) => x;
  function assign(tar, src) {
    // @ts-ignore
    for (const k in src) tar[k] = src[k];
    return tar;
  }
  function add_location(element, file, line, column, char) {
    element.__svelte_meta = {
      loc: { file, line, column, char },
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
    return typeof thing === "function";
  }
  function safe_not_equal(a, b) {
    return a != a
      ? b == b
      : a !== b || (a && typeof a === "object") || typeof a === "function";
  }
  function validate_store(store, name) {
    if (store != null && typeof store.subscribe !== "function") {
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
      if (typeof lets === "object") {
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
    for (const k in props) if (k[0] !== "$") result[k] = props[k];
    return result;
  }
  function action_destroyer(action_result) {
    return action_result && is_function(action_result.destroy)
      ? action_result.destroy
      : noop;
  }

  const is_client = typeof window !== "undefined";
  let now = is_client ? () => window.performance.now() : () => Date.now();
  let raf = is_client ? (cb) => requestAnimationFrame(cb) : noop;

  const tasks = new Set();
  function run_tasks(now) {
    tasks.forEach((task) => {
      if (!task.c(now)) {
        tasks.delete(task);
        task.f();
      }
    });
    if (tasks.size !== 0) raf(run_tasks);
  }
  /**
   * Creates a new task that runs on each raf frame
   * until it returns a falsy value or is aborted
   */
  function loop(callback) {
    let task;
    if (tasks.size === 0) raf(run_tasks);
    return {
      promise: new Promise((fulfill) => {
        tasks.add((task = { c: callback, f: fulfill }));
      }),
      abort() {
        tasks.delete(task);
      },
    };
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
      if (iterations[i]) iterations[i].d(detaching);
    }
  }
  function element(name) {
    return document.createElement(name);
  }
  function text(data) {
    return document.createTextNode(data);
  }
  function space() {
    return text(" ");
  }
  function empty() {
    return text("");
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
    if (value == null) node.removeAttribute(attribute);
    else if (node.getAttribute(attribute) !== value)
      node.setAttribute(attribute, value);
  }
  function set_attributes(node, attributes) {
    // @ts-ignore
    const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
    for (const key in attributes) {
      if (attributes[key] == null) {
        node.removeAttribute(key);
      } else if (key === "style") {
        node.style.cssText = attributes[key];
      } else if (
        key === "__value" ||
        (descriptors[key] && descriptors[key].set)
      ) {
        node[key] = attributes[key];
      } else {
        attr(node, key, attributes[key]);
      }
    }
  }
  function get_binding_group_value(group) {
    const value = [];
    for (let i = 0; i < group.length; i += 1) {
      if (group[i].checked) value.push(group[i].__value);
    }
    return value;
  }
  function to_number(value) {
    return value === "" ? undefined : +value;
  }
  function children(element) {
    return Array.from(element.childNodes);
  }
  function set_input_value(input, value) {
    if (value != null || input.value) {
      input.value = value;
    }
  }
  function set_style(node, key, value, important) {
    node.style.setProperty(key, value, important ? "important" : "");
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
    const selected_option =
      select.querySelector(":checked") || select.options[0];
    return selected_option && selected_option.__value;
  }
  function custom_event(type, detail) {
    const e = document.createEvent("CustomEvent");
    e.initCustomEvent(type, false, false, detail);
    return e;
  }

  const active_docs = new Set();
  let active = 0;
  // https://github.com/darkskyapp/string-hash/blob/master/index.js
  function hash(str) {
    let hash = 5381;
    let i = str.length;
    while (i--) hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
    return hash >>> 0;
  }
  function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
    const step = 16.666 / duration;
    let keyframes = "{\n";
    for (let p = 0; p <= 1; p += step) {
      const t = a + (b - a) * ease(p);
      keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
    }
    const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
    const name = `__svelte_${hash(rule)}_${uid}`;
    const doc = node.ownerDocument;
    active_docs.add(doc);
    const stylesheet =
      doc.__svelte_stylesheet ||
      (doc.__svelte_stylesheet = doc.head.appendChild(element("style")).sheet);
    const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
    if (!current_rules[name]) {
      current_rules[name] = true;
      stylesheet.insertRule(
        `@keyframes ${name} ${rule}`,
        stylesheet.cssRules.length
      );
    }
    const animation = node.style.animation || "";
    node.style.animation = `${
      animation ? `${animation}, ` : ``
    }${name} ${duration}ms linear ${delay}ms 1 both`;
    active += 1;
    return name;
  }
  function delete_rule(node, name) {
    const previous = (node.style.animation || "").split(", ");
    const next = previous.filter(
      name
        ? (anim) => anim.indexOf(name) < 0 // remove specific animation
        : (anim) => anim.indexOf("__svelte") === -1 // remove all Svelte animations
    );
    const deleted = previous.length - next.length;
    if (deleted) {
      node.style.animation = next.join(", ");
      active -= deleted;
      if (!active) clear_rules();
    }
  }
  function clear_rules() {
    raf(() => {
      if (active) return;
      active_docs.forEach((doc) => {
        const stylesheet = doc.__svelte_stylesheet;
        let i = stylesheet.cssRules.length;
        while (i--) stylesheet.deleteRule(i);
        doc.__svelte_rules = {};
      });
      active_docs.clear();
    });
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
        callbacks.slice().forEach((fn) => {
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
    if (flushing) return;
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
      while (binding_callbacks.length) binding_callbacks.pop()();
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

  let promise;
  function wait() {
    if (!promise) {
      promise = Promise.resolve();
      promise.then(() => {
        promise = null;
      });
    }
    return promise;
  }
  function dispatch(node, direction, kind) {
    node.dispatchEvent(custom_event(`${direction ? "intro" : "outro"}${kind}`));
  }
  const outroing = new Set();
  let outros;
  function group_outros() {
    outros = {
      r: 0,
      c: [],
      p: outros, // parent group
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
      if (outroing.has(block)) return;
      outroing.add(block);
      outros.c.push(() => {
        outroing.delete(block);
        if (callback) {
          if (detach) block.d(1);
          callback();
        }
      });
      block.o(local);
    }
  }
  const null_transition = { duration: 0 };
  function create_bidirectional_transition(node, fn, params, intro) {
    let config = fn(node, params);
    let t = intro ? 0 : 1;
    let running_program = null;
    let pending_program = null;
    let animation_name = null;
    function clear_animation() {
      if (animation_name) delete_rule(node, animation_name);
    }
    function init(program, duration) {
      const d = program.b - t;
      duration *= Math.abs(d);
      return {
        a: t,
        b: program.b,
        d,
        duration,
        start: program.start,
        end: program.start + duration,
        group: program.group,
      };
    }
    function go(b) {
      const { delay = 0, duration = 300, easing = identity, tick = noop, css } =
        config || null_transition;
      const program = {
        start: now() + delay,
        b,
      };
      if (!b) {
        // @ts-ignore todo: improve typings
        program.group = outros;
        outros.r += 1;
      }
      if (running_program) {
        pending_program = program;
      } else {
        // if this is an intro, and there's a delay, we need to do
        // an initial tick and/or apply CSS animation immediately
        if (css) {
          clear_animation();
          animation_name = create_rule(
            node,
            t,
            b,
            duration,
            delay,
            easing,
            css
          );
        }
        if (b) tick(0, 1);
        running_program = init(program, duration);
        add_render_callback(() => dispatch(node, b, "start"));
        loop((now) => {
          if (pending_program && now > pending_program.start) {
            running_program = init(pending_program, duration);
            pending_program = null;
            dispatch(node, running_program.b, "start");
            if (css) {
              clear_animation();
              animation_name = create_rule(
                node,
                t,
                running_program.b,
                running_program.duration,
                0,
                easing,
                config.css
              );
            }
          }
          if (running_program) {
            if (now >= running_program.end) {
              tick((t = running_program.b), 1 - t);
              dispatch(node, running_program.b, "end");
              if (!pending_program) {
                // we're done
                if (running_program.b) {
                  // intro — we can tidy up immediately
                  clear_animation();
                } else {
                  // outro — needs to be coordinated
                  if (!--running_program.group.r)
                    run_all(running_program.group.c);
                }
              }
              running_program = null;
            } else if (now >= running_program.start) {
              const p = now - running_program.start;
              t =
                running_program.a +
                running_program.d * easing(p / running_program.duration);
              tick(t, 1 - t);
            }
          }
          return !!(running_program || pending_program);
        });
      }
    }
    return {
      run(b) {
        if (is_function(config)) {
          wait().then(() => {
            // @ts-ignore
            config = config();
            go(b);
          });
        } else {
          go(b);
        }
      },
      end() {
        clear_animation();
        running_program = pending_program = null;
      },
    };
  }

  const globals = typeof window !== "undefined" ? window : global;
  function outro_and_destroy_block(block, lookup) {
    transition_out(block, 1, 1, () => {
      lookup.delete(block.key);
    });
  }
  function update_keyed_each(
    old_blocks,
    dirty,
    get_key,
    dynamic,
    ctx,
    list,
    lookup,
    node,
    destroy,
    create_each_block,
    next,
    get_context
  ) {
    let o = old_blocks.length;
    let n = list.length;
    let i = o;
    const old_indexes = {};
    while (i--) old_indexes[old_blocks[i].key] = i;
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
      } else if (dynamic) {
        block.p(child_ctx, dirty);
      }
      new_lookup.set(key, (new_blocks[i] = block));
      if (key in old_indexes) deltas.set(key, Math.abs(i - old_indexes[key]));
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
      } else if (!new_lookup.has(old_key)) {
        // remove old block
        destroy(old_block, lookup);
        o--;
      } else if (!lookup.has(new_key) || will_move.has(new_key)) {
        insert(new_block);
      } else if (did_move.has(old_key)) {
        o--;
      } else if (deltas.get(new_key) > deltas.get(old_key)) {
        did_move.add(new_key);
        insert(new_block);
      } else {
        will_move.add(old_key);
        o--;
      }
    }
    while (o--) {
      const old_block = old_blocks[o];
      if (!new_lookup.has(old_block.key)) destroy(old_block, lookup);
    }
    while (n) insert(new_blocks[n - 1]);
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
          if (!(key in n)) to_null_out[key] = 1;
        }
        for (const key in n) {
          if (!accounted_for[key]) {
            update[key] = n[key];
            accounted_for[key] = 1;
          }
        }
        levels[i] = n;
      } else {
        for (const key in o) {
          accounted_for[key] = 1;
        }
      }
    }
    for (const key in to_null_out) {
      if (!(key in update)) update[key] = undefined;
    }
    return update;
  }
  function get_spread_object(spread_props) {
    return typeof spread_props === "object" && spread_props !== null
      ? spread_props
      : {};
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
      } else {
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
    component.$$.dirty[(i / 31) | 0] |= 1 << i % 31;
  }
  function init(
    component,
    options,
    instance,
    create_fragment,
    not_equal,
    props,
    dirty = [-1]
  ) {
    const parent_component = current_component;
    set_current_component(component);
    const prop_values = options.props || {};
    const $$ = (component.$$ = {
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
      dirty,
    });
    let ready = false;
    $$.ctx = instance
      ? instance(component, prop_values, (i, ret, ...rest) => {
          const value = rest.length ? rest[0] : ret;
          if ($$.ctx && not_equal($$.ctx[i], ($$.ctx[i] = value))) {
            if ($$.bound[i]) $$.bound[i](value);
            if (ready) make_dirty(component, i);
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
      } else {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        $$.fragment && $$.fragment.c();
      }
      if (options.intro) transition_in(component.$$.fragment);
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
      const callbacks =
        this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
      callbacks.push(callback);
      return () => {
        const index = callbacks.indexOf(callback);
        if (index !== -1) callbacks.splice(index, 1);
      };
    }
    $set() {
      // overridden by instance, if it has props
    }
  }

  function dispatch_dev(type, detail) {
    document.dispatchEvent(
      custom_event(type, Object.assign({ version: "3.20.1" }, detail))
    );
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
  function listen_dev(
    node,
    event,
    handler,
    options,
    has_prevent_default,
    has_stop_propagation
  ) {
    const modifiers =
      options === true
        ? ["capture"]
        : options
        ? Array.from(Object.keys(options))
        : [];
    if (has_prevent_default) modifiers.push("preventDefault");
    if (has_stop_propagation) modifiers.push("stopPropagation");
    dispatch_dev("SvelteDOMAddEventListener", {
      node,
      event,
      handler,
      modifiers,
    });
    const dispose = listen(node, event, handler, options);
    return () => {
      dispatch_dev("SvelteDOMRemoveEventListener", {
        node,
        event,
        handler,
        modifiers,
      });
      dispose();
    };
  }
  function attr_dev(node, attribute, value) {
    attr(node, attribute, value);
    if (value == null)
      dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
    else dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
  }
  function prop_dev(node, property, value) {
    node[property] = value;
    dispatch_dev("SvelteDOMSetProperty", { node, property, value });
  }
  function set_data_dev(text, data) {
    data = "" + data;
    if (text.data === data) return;
    dispatch_dev("SvelteDOMSetData", { node: text, data });
    text.data = data;
  }
  function validate_each_argument(arg) {
    if (
      typeof arg !== "string" &&
      !(arg && typeof arg === "object" && "length" in arg)
    ) {
      let msg = "{#each} only iterates over array-like objects.";
      if (typeof Symbol === "function" && arg && Symbol.iterator in arg) {
        msg += " You can use a spread to convert this iterable into an array.";
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
    $capture_state() {}
    $inject_state() {}
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
        if (stop) {
          // store is ready
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
    const stores_array = single ? [stores] : stores;
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
        } else {
          cleanup = is_function(result) ? result : noop;
        }
      };
      const unsubscribers = stores_array.map((store, i) =>
        subscribe(
          store,
          (value) => {
            values[i] = value;
            pending &= ~(1 << i);
            if (inited) {
              sync();
            }
          },
          () => {
            pending |= 1 << i;
          }
        )
      );
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
      key: (source.history.state && source.history.state.key) || "initial",
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
        listeners.forEach((listener) => listener({ location, action: "PUSH" }));
      },
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
        },
      },
    };
  }

  // Global history uses window.history as the source if available,
  // otherwise a memory history
  const canUseDOM = Boolean(
    typeof window !== "undefined" &&
      window.document &&
      window.document.createElement
  );
  const globalHistory = createHistory(
    canUseDOM ? window : createMemorySource()
  );
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
          uri,
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
          uri: "/" + uriSegments.slice(0, index).join("/"),
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

    allSegments.forEach((segment) => {
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
      path === "/"
        ? basepath
        : `${stripSlashes(basepath)}/${stripSlashes(path)}`
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
    );
  }

  /* node_modules\svelte-routing\src\Router.svelte generated by Svelte v3.20.1 */

  function create_fragment(ctx) {
    let current;
    const default_slot_template = /*$$slots*/ ctx[16].default;
    const default_slot = create_slot(
      default_slot_template,
      ctx,
      /*$$scope*/ ctx[15],
      null
    );

    const block = {
      c: function create() {
        if (default_slot) default_slot.c();
      },
      l: function claim(nodes) {
        throw new Error(
          "options.hydrate only works if the component was compiled with the `hydratable: true` option"
        );
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
            default_slot.p(
              get_slot_context(
                default_slot_template,
                ctx,
                /*$$scope*/ ctx[15],
                null
              ),
              get_slot_changes(
                default_slot_template,
                /*$$scope*/ ctx[15],
                dirty,
                null
              )
            );
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
      },
    };

    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_fragment.name,
      type: "component",
      source: "",
      ctx,
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
    component_subscribe($$self, routes, (value) =>
      $$invalidate(8, ($routes = value))
    );
    const activeRoute = writable(null);
    let hasActiveRoute = false; // Used in SSR to synchronously set that a Route is active.

    // If locationContext is not set, this is the topmost Router in the tree.
    // If the `url` prop is given we force the location to it.
    const location =
      locationContext ||
      writable(url ? { pathname: url } : globalHistory.location);

    validate_store(location, "location");
    component_subscribe($$self, location, (value) =>
      $$invalidate(7, ($location = value))
    );

    // If routerContext is set, the routerBase of the parent Router
    // will be the base for this Router's descendants.
    // If routerContext is not set, the path and resolved uri will both
    // have the value of the basepath prop.
    const base = routerContext
      ? routerContext.routerBase
      : writable({ path: basepath, uri: basepath });

    validate_store(base, "base");
    component_subscribe($$self, base, (value) =>
      $$invalidate(6, ($base = value))
    );

    const routerBase = derived([base, activeRoute], ([base, activeRoute]) => {
      // If there is no activeRoute, the routerBase will be identical to the base.
      if (activeRoute === null) {
        return base;
      }

      const { path: basepath } = base;
      const { route, uri } = activeRoute;

      // Remove the potential /* or /*splatname from
      // the end of the child Routes relative paths.
      const path = route.default ? basepath : route.path.replace(/\*.*$/, "");

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
        routes.update((rs) => {
          rs.push(route);
          return rs;
        });
      }
    }

    function unregisterRoute(route) {
      routes.update((rs) => {
        const index = rs.indexOf(route);
        rs.splice(index, 1);
        return rs;
      });
    }

    if (!locationContext) {
      // The topmost Router in the tree is responsible for updating
      // the location store and supplying it through context.
      onMount(() => {
        const unlisten = globalHistory.listen((history) => {
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
      unregisterRoute,
    });

    const writable_props = ["basepath", "url"];

    Object.keys($$props).forEach((key) => {
      if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$")
        console.warn(`<Router> was created with unknown prop '${key}'`);
    });

    let { $$slots = {}, $$scope } = $$props;
    validate_slots("Router", $$slots, ["default"]);

    $$self.$set = ($$props) => {
      if ("basepath" in $$props) $$invalidate(3, (basepath = $$props.basepath));
      if ("url" in $$props) $$invalidate(4, (url = $$props.url));
      if ("$$scope" in $$props) $$invalidate(15, ($$scope = $$props.$$scope));
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
      $routes,
    });

    $$self.$inject_state = ($$props) => {
      if ("basepath" in $$props) $$invalidate(3, (basepath = $$props.basepath));
      if ("url" in $$props) $$invalidate(4, (url = $$props.url));
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

          routes.update((rs) => {
            rs.forEach((r) => (r.path = combinePaths(basepath, r._path)));
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
      $$slots,
    ];
  }

  class Router extends SvelteComponentDev {
    constructor(options) {
      super(options);
      init(this, options, instance, create_fragment, safe_not_equal, {
        basepath: 3,
        url: 4,
      });

      dispatch_dev("SvelteRegisterComponent", {
        component: this,
        tagName: "Router",
        options,
        id: create_fragment.name,
      });
    }

    get basepath() {
      throw new Error(
        "<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
      );
    }

    set basepath(value) {
      throw new Error(
        "<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
      );
    }

    get url() {
      throw new Error(
        "<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
      );
    }

    set url(value) {
      throw new Error(
        "<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
      );
    }
  }

  /* node_modules\svelte-routing\src\Route.svelte generated by Svelte v3.20.1 */

  const get_default_slot_changes = (dirty) => ({
    params: dirty & /*routeParams*/ 2,
    location: dirty & /*$location*/ 16,
  });

  const get_default_slot_context = (ctx) => ({
    params: /*routeParams*/ ctx[1],
    location: /*$location*/ ctx[4],
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
    if_block = if_blocks[current_block_type_index] = if_block_creators[
      current_block_type_index
    ](ctx);

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
            if_block = if_blocks[current_block_type_index] = if_block_creators[
              current_block_type_index
            ](ctx);
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
      },
    };

    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_if_block.name,
      type: "if",
      source:
        "(40:0) {#if $activeRoute !== null && $activeRoute.route === route}",
      ctx,
    });

    return block;
  }

  // (43:2) {:else}
  function create_else_block(ctx) {
    let current;
    const default_slot_template = /*$$slots*/ ctx[13].default;
    const default_slot = create_slot(
      default_slot_template,
      ctx,
      /*$$scope*/ ctx[12],
      get_default_slot_context
    );

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
          if (
            default_slot.p &&
            dirty & /*$$scope, routeParams, $location*/ 4114
          ) {
            default_slot.p(
              get_slot_context(
                default_slot_template,
                ctx,
                /*$$scope*/ ctx[12],
                get_default_slot_context
              ),
              get_slot_changes(
                default_slot_template,
                /*$$scope*/ ctx[12],
                dirty,
                get_default_slot_changes
              )
            );
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
      },
    };

    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_else_block.name,
      type: "else",
      source: "(43:2) {:else}",
      ctx,
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
      /*routeProps*/ ctx[2],
    ];

    var switch_value = /*component*/ ctx[0];

    function switch_props(ctx) {
      let switch_instance_props = {};

      for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
        switch_instance_props = assign(
          switch_instance_props,
          switch_instance_spread_levels[i]
        );
      }

      return {
        props: switch_instance_props,
        $$inline: true,
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
        const switch_instance_changes =
          dirty & /*$location, routeParams, routeProps*/ 22
            ? get_spread_update(switch_instance_spread_levels, [
                dirty & /*$location*/ 16 && { location: /*$location*/ ctx[4] },
                dirty & /*routeParams*/ 2 &&
                  get_spread_object(/*routeParams*/ ctx[1]),
                dirty & /*routeProps*/ 4 &&
                  get_spread_object(/*routeProps*/ ctx[2]),
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
            mount_component(
              switch_instance,
              switch_instance_anchor.parentNode,
              switch_instance_anchor
            );
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
      },
    };

    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_if_block_1.name,
      type: "if",
      source: "(41:2) {#if component !== null}",
      ctx,
    });

    return block;
  }

  function create_fragment$1(ctx) {
    let if_block_anchor;
    let current;
    let if_block =
      /*$activeRoute*/ ctx[3] !== null &&
      /*$activeRoute*/ ctx[3].route === /*route*/ ctx[7] &&
      create_if_block(ctx);

    const block = {
      c: function create() {
        if (if_block) if_block.c();
        if_block_anchor = empty();
      },
      l: function claim(nodes) {
        throw new Error(
          "options.hydrate only works if the component was compiled with the `hydratable: true` option"
        );
      },
      m: function mount(target, anchor) {
        if (if_block) if_block.m(target, anchor);
        insert_dev(target, if_block_anchor, anchor);
        current = true;
      },
      p: function update(ctx, [dirty]) {
        if (
          /*$activeRoute*/ ctx[3] !== null &&
          /*$activeRoute*/ ctx[3].route === /*route*/ ctx[7]
        ) {
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
      },
    };

    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_fragment$1.name,
      type: "component",
      source: "",
      ctx,
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
    component_subscribe($$self, activeRoute, (value) =>
      $$invalidate(3, ($activeRoute = value))
    );
    const location = getContext(LOCATION);
    validate_store(location, "location");
    component_subscribe($$self, location, (value) =>
      $$invalidate(4, ($location = value))
    );

    const route = {
      path,
      // If no path prop is given, this Route will act as the default Route
      // that is rendered if no other Route in the Router is a match.
      default: path === "",
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
    validate_slots("Route", $$slots, ["default"]);

    $$self.$set = ($$new_props) => {
      $$invalidate(
        11,
        ($$props = assign(
          assign({}, $$props),
          exclude_internal_props($$new_props)
        ))
      );
      if ("path" in $$new_props) $$invalidate(8, (path = $$new_props.path));
      if ("component" in $$new_props)
        $$invalidate(0, (component = $$new_props.component));
      if ("$$scope" in $$new_props)
        $$invalidate(12, ($$scope = $$new_props.$$scope));
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
      $location,
    });

    $$self.$inject_state = ($$new_props) => {
      $$invalidate(11, ($$props = assign(assign({}, $$props), $$new_props)));
      if ("path" in $$props) $$invalidate(8, (path = $$new_props.path));
      if ("component" in $$props)
        $$invalidate(0, (component = $$new_props.component));
      if ("routeParams" in $$props)
        $$invalidate(1, (routeParams = $$new_props.routeParams));
      if ("routeProps" in $$props)
        $$invalidate(2, (routeProps = $$new_props.routeProps));
    };

    if ($$props && "$$inject" in $$props) {
      $$self.$inject_state($$props.$$inject);
    }

    $$self.$$.update = () => {
      if ($$self.$$.dirty & /*$activeRoute*/ 8) {
        if ($activeRoute && $activeRoute.route === route) {
          $$invalidate(1, (routeParams = $activeRoute.params));
        }
      }

      {
        const { path, component, ...rest } = $$props;
        $$invalidate(2, (routeProps = rest));
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
      $$slots,
    ];
  }

  class Route extends SvelteComponentDev {
    constructor(options) {
      super(options);
      init(this, options, instance$1, create_fragment$1, safe_not_equal, {
        path: 8,
        component: 0,
      });

      dispatch_dev("SvelteRegisterComponent", {
        component: this,
        tagName: "Route",
        options,
        id: create_fragment$1.name,
      });
    }

    get path() {
      throw new Error(
        "<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
      );
    }

    set path(value) {
      throw new Error(
        "<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
      );
    }

    get component() {
      throw new Error(
        "<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
      );
    }

    set component(value) {
      throw new Error(
        "<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
      );
    }
  }

  /* node_modules\svelte-routing\src\Link.svelte generated by Svelte v3.20.1 */
  const file = "node_modules\\svelte-routing\\src\\Link.svelte";

  function create_fragment$2(ctx) {
    let a;
    let current;
    let dispose;
    const default_slot_template = /*$$slots*/ ctx[16].default;
    const default_slot = create_slot(
      default_slot_template,
      ctx,
      /*$$scope*/ ctx[15],
      null
    );

    let a_levels = [
      { href: /*href*/ ctx[0] },
      { "aria-current": /*ariaCurrent*/ ctx[2] },
      /*props*/ ctx[1],
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
        throw new Error(
          "options.hydrate only works if the component was compiled with the `hydratable: true` option"
        );
      },
      m: function mount(target, anchor, remount) {
        insert_dev(target, a, anchor);

        if (default_slot) {
          default_slot.m(a, null);
        }

        current = true;
        if (remount) dispose();
        dispose = listen_dev(
          a,
          "click",
          /*onClick*/ ctx[5],
          false,
          false,
          false
        );
      },
      p: function update(ctx, [dirty]) {
        if (default_slot) {
          if (default_slot.p && dirty & /*$$scope*/ 32768) {
            default_slot.p(
              get_slot_context(
                default_slot_template,
                ctx,
                /*$$scope*/ ctx[15],
                null
              ),
              get_slot_changes(
                default_slot_template,
                /*$$scope*/ ctx[15],
                dirty,
                null
              )
            );
          }
        }

        set_attributes(
          a,
          get_spread_update(a_levels, [
            dirty & /*href*/ 1 && { href: /*href*/ ctx[0] },
            dirty & /*ariaCurrent*/ 4 && {
              "aria-current": /*ariaCurrent*/ ctx[2],
            },
            dirty & /*props*/ 2 && /*props*/ ctx[1],
          ])
        );
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
      },
    };

    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_fragment$2.name,
      type: "component",
      source: "",
      ctx,
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
    component_subscribe($$self, base, (value) =>
      $$invalidate(12, ($base = value))
    );
    const location = getContext(LOCATION);
    validate_store(location, "location");
    component_subscribe($$self, location, (value) =>
      $$invalidate(13, ($location = value))
    );
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

    Object.keys($$props).forEach((key) => {
      if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$")
        console.warn(`<Link> was created with unknown prop '${key}'`);
    });

    let { $$slots = {}, $$scope } = $$props;
    validate_slots("Link", $$slots, ["default"]);

    $$self.$set = ($$props) => {
      if ("to" in $$props) $$invalidate(6, (to = $$props.to));
      if ("replace" in $$props) $$invalidate(7, (replace = $$props.replace));
      if ("state" in $$props) $$invalidate(8, (state = $$props.state));
      if ("getProps" in $$props) $$invalidate(9, (getProps = $$props.getProps));
      if ("$$scope" in $$props) $$invalidate(15, ($$scope = $$props.$$scope));
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
      ariaCurrent,
    });

    $$self.$inject_state = ($$props) => {
      if ("to" in $$props) $$invalidate(6, (to = $$props.to));
      if ("replace" in $$props) $$invalidate(7, (replace = $$props.replace));
      if ("state" in $$props) $$invalidate(8, (state = $$props.state));
      if ("getProps" in $$props) $$invalidate(9, (getProps = $$props.getProps));
      if ("href" in $$props) $$invalidate(0, (href = $$props.href));
      if ("isPartiallyCurrent" in $$props)
        $$invalidate(10, (isPartiallyCurrent = $$props.isPartiallyCurrent));
      if ("isCurrent" in $$props)
        $$invalidate(11, (isCurrent = $$props.isCurrent));
      if ("props" in $$props) $$invalidate(1, (props = $$props.props));
      if ("ariaCurrent" in $$props)
        $$invalidate(2, (ariaCurrent = $$props.ariaCurrent));
    };

    let ariaCurrent;

    if ($$props && "$$inject" in $$props) {
      $$self.$inject_state($$props.$$inject);
    }

    $$self.$$.update = () => {
      if ($$self.$$.dirty & /*to, $base*/ 4160) {
        $$invalidate(
          0,
          (href = to === "/" ? $base.uri : resolve(to, $base.uri))
        );
      }

      if ($$self.$$.dirty & /*$location, href*/ 8193) {
        $$invalidate(
          10,
          (isPartiallyCurrent = startsWith($location.pathname, href))
        );
      }

      if ($$self.$$.dirty & /*href, $location*/ 8193) {
        $$invalidate(11, (isCurrent = href === $location.pathname));
      }

      if ($$self.$$.dirty & /*isCurrent*/ 2048) {
        $$invalidate(2, (ariaCurrent = isCurrent ? "page" : undefined));
      }

      if (
        $$self.$$.dirty &
        /*getProps, $location, href, isPartiallyCurrent, isCurrent*/ 11777
      ) {
        $$invalidate(
          1,
          (props = getProps({
            location: $location,
            href,
            isPartiallyCurrent,
            isCurrent,
          }))
        );
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
      $$slots,
    ];
  }

  class Link extends SvelteComponentDev {
    constructor(options) {
      super(options);
      init(this, options, instance$2, create_fragment$2, safe_not_equal, {
        to: 6,
        replace: 7,
        state: 8,
        getProps: 9,
      });

      dispatch_dev("SvelteRegisterComponent", {
        component: this,
        tagName: "Link",
        options,
        id: create_fragment$2.name,
      });
    }

    get to() {
      throw new Error(
        "<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
      );
    }

    set to(value) {
      throw new Error(
        "<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
      );
    }

    get replace() {
      throw new Error(
        "<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
      );
    }

    set replace(value) {
      throw new Error(
        "<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
      );
    }

    get state() {
      throw new Error(
        "<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
      );
    }

    set state(value) {
      throw new Error(
        "<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
      );
    }

    get getProps() {
      throw new Error(
        "<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
      );
    }

    set getProps(value) {
      throw new Error(
        "<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
      );
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
        navigate(anchor.pathname + anchor.search, {
          replace: anchor.hasAttribute("replace"),
        });
      }
    }

    node.addEventListener("click", onClick);

    return {
      destroy() {
        node.removeEventListener("click", onClick);
      },
    };
  }

  function cubicOut(t) {
    const f = t - 1.0;
    return f * f * f + 1.0;
  }
  function quintOut(t) {
    return --t * t * t * t * t + 1;
  }

  function fade(node, { delay = 0, duration = 400, easing = identity }) {
    const o = +getComputedStyle(node).opacity;
    return {
      delay,
      duration,
      easing,
      css: (t) => `opacity: ${t * o}`,
    };
  }
  function fly(
    node,
    { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 }
  ) {
    const style = getComputedStyle(node);
    const target_opacity = +style.opacity;
    const transform = style.transform === "none" ? "" : style.transform;
    const od = target_opacity * (1 - opacity);
    return {
      delay,
      duration,
      easing,
      css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - od * u}`,
    };
  }

  async function getRandomQuote() {
    const url = "http://quotes.stormconsultancy.co.uk/random.json";
    try {
      let quote = await fetch(url);
      quote = await quote.json();
      return {
        en: quote.quote,
        author: { name: quote.author },
      };
    } catch (error) {
      console.log(error);
    }
  }

  var getRandomQuote_1 = getRandomQuote;

  /* src\client\routes\AddQuote.svelte generated by Svelte v3.20.1 */

  const { Object: Object_1 } = globals;
  const file$1 = "src\\client\\routes\\AddQuote.svelte";

  // (94:6) {#if errors !== null}
  function create_if_block_4(ctx) {
    let if_block_anchor;

    function select_block_type(ctx, dirty) {
      if (/*errors*/ ctx[3].name == null) return create_if_block_5;
      return create_else_block_1;
    }

    let current_block_type = select_block_type(ctx);
    let if_block = current_block_type(ctx);

    const block = {
      c: function create() {
        if_block.c();
        if_block_anchor = empty();
      },
      m: function mount(target, anchor) {
        if_block.m(target, anchor);
        insert_dev(target, if_block_anchor, anchor);
      },
      p: function update(ctx, dirty) {
        if (
          current_block_type ===
            (current_block_type = select_block_type(ctx)) &&
          if_block
        ) {
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
      d: function destroy(detaching) {
        if_block.d(detaching);
        if (detaching) detach_dev(if_block_anchor);
      },
    };

    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_if_block_4.name,
      type: "if",
      source: "(94:6) {#if errors !== null}",
      ctx,
    });

    return block;
  }

  // (97:8) {:else}
  function create_else_block_1(ctx) {
    let div;
    let t_value = /*errors*/ ctx[3].name + "";
    let t;

    const block = {
      c: function create() {
        div = element("div");
        t = text(t_value);
        attr_dev(div, "class", "invalid-feedback");
        add_location(div, file$1, 97, 10, 2357);
      },
      m: function mount(target, anchor) {
        insert_dev(target, div, anchor);
        append_dev(div, t);
      },
      p: function update(ctx, dirty) {
        if (
          dirty & /*errors*/ 8 &&
          t_value !== (t_value = /*errors*/ ctx[3].name + "")
        )
          set_data_dev(t, t_value);
      },
      d: function destroy(detaching) {
        if (detaching) detach_dev(div);
      },
    };

    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_else_block_1.name,
      type: "else",
      source: "(97:8) {:else}",
      ctx,
    });

    return block;
  }

  // (95:8) {#if errors.name == null}
  function create_if_block_5(ctx) {
    let div;

    const block = {
      c: function create() {
        div = element("div");
        div.textContent = "Valid.";
        attr_dev(div, "class", "valid-feedback");
        add_location(div, file$1, 95, 10, 2288);
      },
      m: function mount(target, anchor) {
        insert_dev(target, div, anchor);
      },
      p: noop,
      d: function destroy(detaching) {
        if (detaching) detach_dev(div);
      },
    };

    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_if_block_5.name,
      type: "if",
      source: "(95:8) {#if errors.name == null}",
      ctx,
    });

    return block;
  }

  // (112:6) {#if errors !== null}
  function create_if_block_2(ctx) {
    let if_block_anchor;

    function select_block_type_1(ctx, dirty) {
      if (/*errors*/ ctx[3].quoteContents == null) return create_if_block_3;
      return create_else_block$1;
    }

    let current_block_type = select_block_type_1(ctx);
    let if_block = current_block_type(ctx);

    const block = {
      c: function create() {
        if_block.c();
        if_block_anchor = empty();
      },
      m: function mount(target, anchor) {
        if_block.m(target, anchor);
        insert_dev(target, if_block_anchor, anchor);
      },
      p: function update(ctx, dirty) {
        if (
          current_block_type ===
            (current_block_type = select_block_type_1(ctx)) &&
          if_block
        ) {
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
      d: function destroy(detaching) {
        if_block.d(detaching);
        if (detaching) detach_dev(if_block_anchor);
      },
    };

    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_if_block_2.name,
      type: "if",
      source: "(112:6) {#if errors !== null}",
      ctx,
    });

    return block;
  }

  // (115:8) {:else}
  function create_else_block$1(ctx) {
    let div;
    let t_value = /*errors*/ ctx[3].quoteContents + "";
    let t;

    const block = {
      c: function create() {
        div = element("div");
        t = text(t_value);
        attr_dev(div, "class", "invalid-feedback");
        add_location(div, file$1, 115, 10, 2844);
      },
      m: function mount(target, anchor) {
        insert_dev(target, div, anchor);
        append_dev(div, t);
      },
      p: function update(ctx, dirty) {
        if (
          dirty & /*errors*/ 8 &&
          t_value !== (t_value = /*errors*/ ctx[3].quoteContents + "")
        )
          set_data_dev(t, t_value);
      },
      d: function destroy(detaching) {
        if (detaching) detach_dev(div);
      },
    };

    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_else_block$1.name,
      type: "else",
      source: "(115:8) {:else}",
      ctx,
    });

    return block;
  }

  // (113:8) {#if errors.quoteContents == null}
  function create_if_block_3(ctx) {
    let div;

    const block = {
      c: function create() {
        div = element("div");
        div.textContent = "Valid.";
        attr_dev(div, "class", "valid-feedback");
        add_location(div, file$1, 113, 10, 2775);
      },
      m: function mount(target, anchor) {
        insert_dev(target, div, anchor);
      },
      p: noop,
      d: function destroy(detaching) {
        if (detaching) detach_dev(div);
      },
    };

    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_if_block_3.name,
      type: "if",
      source: "(113:8) {#if errors.quoteContents == null}",
      ctx,
    });

    return block;
  }

  // (131:4) {#if showRating}
  function create_if_block_1$1(ctx) {
    let div;
    let label;
    let t0;
    let t1_value = /*input*/ ctx[1].rating + "";
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
        add_location(label, file$1, 132, 8, 3300);
        attr_dev(input_1, "type", "range");
        attr_dev(input_1, "class", "custom-range");
        attr_dev(input_1, "id", "rating");
        attr_dev(input_1, "name", "rating");
        attr_dev(input_1, "min", "0");
        attr_dev(input_1, "max", "5");
        attr_dev(input_1, "step", "0.1");
        add_location(input_1, file$1, 133, 8, 3359);
        attr_dev(div, "class", "form-group");
        add_location(div, file$1, 131, 6, 3266);
      },
      m: function mount(target, anchor, remount) {
        insert_dev(target, div, anchor);
        append_dev(div, label);
        append_dev(label, t0);
        append_dev(label, t1);
        append_dev(div, t2);
        append_dev(div, input_1);
        set_input_value(input_1, /*input*/ ctx[1].rating);
        if (remount) run_all(dispose);

        dispose = [
          listen_dev(
            input_1,
            "change",
            /*input_1_change_input_handler*/ ctx[15]
          ),
          listen_dev(
            input_1,
            "input",
            /*input_1_change_input_handler*/ ctx[15]
          ),
        ];
      },
      p: function update(ctx, dirty) {
        if (
          dirty & /*input*/ 2 &&
          t1_value !== (t1_value = /*input*/ ctx[1].rating + "")
        )
          set_data_dev(t1, t1_value);

        if (dirty & /*input*/ 2) {
          set_input_value(input_1, /*input*/ ctx[1].rating);
        }
      },
      d: function destroy(detaching) {
        if (detaching) detach_dev(div);
        run_all(dispose);
      },
    };

    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_if_block_1$1.name,
      type: "if",
      source: "(131:4) {#if showRating}",
      ctx,
    });

    return block;
  }

  // (155:0) {#if showModal}
  function create_if_block$1(ctx) {
    let div5;
    let div4;
    let div3;
    let div0;
    let h4;
    let t1;
    let button0;
    let t3;
    let div1;
    let t5;
    let div2;
    let button1;
    let t7;
    let button2;
    let div5_transition;
    let t9;
    let div6;
    let div6_transition;
    let current;
    let dispose;

    const block = {
      c: function create() {
        div5 = element("div");
        div4 = element("div");
        div3 = element("div");
        div0 = element("div");
        h4 = element("h4");
        h4.textContent = "Modal Heading";
        t1 = space();
        button0 = element("button");
        button0.textContent = "×";
        t3 = space();
        div1 = element("div");
        div1.textContent = "Modal body..";
        t5 = space();
        div2 = element("div");
        button1 = element("button");
        button1.textContent = "Get Quote";
        t7 = space();
        button2 = element("button");
        button2.textContent = "Close";
        t9 = space();
        div6 = element("div");
        attr_dev(h4, "class", "modal-title");
        add_location(h4, file$1, 165, 10, 4126);
        attr_dev(button0, "type", "button");
        attr_dev(button0, "class", "close");
        add_location(button0, file$1, 166, 10, 4180);
        attr_dev(div0, "class", "modal-header");
        add_location(div0, file$1, 164, 8, 4088);
        attr_dev(div1, "class", "modal-body");
        add_location(div1, file$1, 172, 8, 4338);
        attr_dev(button1, "class", "btn btn-primary");
        add_location(button1, file$1, 176, 10, 4461);
        attr_dev(button2, "type", "button");
        attr_dev(button2, "class", "btn btn-danger");
        add_location(button2, file$1, 179, 10, 4572);
        attr_dev(div2, "class", "modal-footer");
        add_location(div2, file$1, 175, 8, 4423);
        attr_dev(div3, "class", "modal-content");
        add_location(div3, file$1, 161, 6, 4018);
        attr_dev(div4, "class", "modal-dialog");
        add_location(div4, file$1, 160, 4, 3984);
        attr_dev(div5, "class", "modal");
        set_style(div5, "display", "block");
        add_location(div5, file$1, 156, 2, 3877);
        attr_dev(div6, "class", "modal-backdrop show");
        add_location(div6, file$1, 188, 2, 4740);
      },
      m: function mount(target, anchor, remount) {
        insert_dev(target, div5, anchor);
        append_dev(div5, div4);
        append_dev(div4, div3);
        append_dev(div3, div0);
        append_dev(div0, h4);
        append_dev(div0, t1);
        append_dev(div0, button0);
        append_dev(div3, t3);
        append_dev(div3, div1);
        append_dev(div3, t5);
        append_dev(div3, div2);
        append_dev(div2, button1);
        append_dev(div2, t7);
        append_dev(div2, button2);
        insert_dev(target, t9, anchor);
        insert_dev(target, div6, anchor);
        current = true;
        if (remount) run_all(dispose);

        dispose = [
          listen_dev(button0, "click", toggleModal, false, false, false),
          listen_dev(
            button1,
            "click",
            /*handleClick*/ ctx[7],
            false,
            false,
            false
          ),
          listen_dev(button2, "click", toggleModal, false, false, false),
        ];
      },
      p: noop,
      i: function intro(local) {
        if (current) return;

        add_render_callback(() => {
          if (!div5_transition)
            div5_transition = create_bidirectional_transition(
              div5,
              fly,
              { y: 200, duration: 500 },
              true
            );
          div5_transition.run(1);
        });

        add_render_callback(() => {
          if (!div6_transition)
            div6_transition = create_bidirectional_transition(
              div6,
              fade,
              {},
              true
            );
          div6_transition.run(1);
        });

        current = true;
      },
      o: function outro(local) {
        if (!div5_transition)
          div5_transition = create_bidirectional_transition(
            div5,
            fly,
            { y: 200, duration: 500 },
            false
          );
        div5_transition.run(0);
        if (!div6_transition)
          div6_transition = create_bidirectional_transition(
            div6,
            fade,
            {},
            false
          );
        div6_transition.run(0);
        current = false;
      },
      d: function destroy(detaching) {
        if (detaching) detach_dev(div5);
        if (detaching && div5_transition) div5_transition.end();
        if (detaching) detach_dev(t9);
        if (detaching) detach_dev(div6);
        if (detaching && div6_transition) div6_transition.end();
        run_all(dispose);
      },
    };

    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_if_block$1.name,
      type: "if",
      source: "(155:0) {#if showModal}",
      ctx,
    });

    return block;
  }

  function create_fragment$3(ctx) {
    let div3;
    let form;
    let div0;
    let label0;
    let t1;
    let input0;
    let input0_class_value;
    let t2;
    let t3;
    let div1;
    let label1;
    let t5;
    let textarea;
    let textarea_class_value;
    let t6;
    let t7;
    let div2;
    let input1;
    let t8;
    let label2;
    let t10;
    let t11;
    let button0;
    let t13;
    let button1;
    let t15;
    let if_block3_anchor;
    let current;
    let dispose;
    let if_block0 = /*errors*/ ctx[3] !== null && create_if_block_4(ctx);
    let if_block1 = /*errors*/ ctx[3] !== null && create_if_block_2(ctx);
    let if_block2 = /*showRating*/ ctx[2] && create_if_block_1$1(ctx);
    let if_block3 = /*showModal*/ ctx[5] && create_if_block$1(ctx);

    const block = {
      c: function create() {
        div3 = element("div");
        form = element("form");
        div0 = element("div");
        label0 = element("label");
        label0.textContent = "Author's Name*";
        t1 = space();
        input0 = element("input");
        t2 = space();
        if (if_block0) if_block0.c();
        t3 = space();
        div1 = element("div");
        label1 = element("label");
        label1.textContent = "Quote Contents*";
        t5 = space();
        textarea = element("textarea");
        t6 = space();
        if (if_block1) if_block1.c();
        t7 = space();
        div2 = element("div");
        input1 = element("input");
        t8 = space();
        label2 = element("label");
        label2.textContent = "Include Rating";
        t10 = space();
        if (if_block2) if_block2.c();
        t11 = space();
        button0 = element("button");
        button0.textContent = "Submit Quote";
        t13 = space();
        button1 = element("button");
        button1.textContent = "Generate Quote for me";
        t15 = space();
        if (if_block3) if_block3.c();
        if_block3_anchor = empty();
        attr_dev(label0, "for", "author");
        add_location(label0, file$1, 84, 6, 1963);
        attr_dev(input0, "type", "text");
        attr_dev(
          input0,
          "class",
          (input0_class_value = "form-control " + /*authorClass*/ ctx[0])
        );
        attr_dev(input0, "placeholder", "Enter name");
        attr_dev(input0, "id", "author");
        attr_dev(input0, "autocomplete", "off");
        add_location(input0, file$1, 85, 6, 2013);
        attr_dev(div0, "class", "form-group");
        add_location(div0, file$1, 83, 4, 1931);
        attr_dev(label1, "for", "quote-contents");
        add_location(label1, file$1, 103, 6, 2486);
        attr_dev(
          textarea,
          "class",
          (textarea_class_value =
            "form-control " + /*quoteContentsClass*/ ctx[4])
        );
        attr_dev(textarea, "rows", "5");
        attr_dev(textarea, "id", "quote-contents");
        add_location(textarea, file$1, 105, 6, 2547);
        attr_dev(div1, "class", "form-group");
        add_location(div1, file$1, 102, 4, 2454);
        attr_dev(input1, "type", "checkbox");
        attr_dev(input1, "class", "custom-control-input");
        attr_dev(input1, "id", "switch1");
        add_location(input1, file$1, 122, 6, 3013);
        attr_dev(label2, "class", "custom-control-label");
        attr_dev(label2, "for", "switch1");
        add_location(label2, file$1, 127, 6, 3150);
        attr_dev(div2, "class", "form-group custom-control custom-switch");
        add_location(div2, file$1, 121, 4, 2952);
        attr_dev(button0, "type", "submit");
        attr_dev(button0, "class", "btn btn-primary");
        add_location(button0, file$1, 145, 4, 3602);
        attr_dev(form, "class", "p-3 svelte-126g4jm");
        add_location(form, file$1, 81, 2, 1865);
        attr_dev(div3, "class", "form-wrapper p-3");
        add_location(div3, file$1, 79, 0, 1829);
        attr_dev(button1, "type", "button");
        attr_dev(button1, "class", "btn btn-success");
        add_location(button1, file$1, 150, 0, 3727);
      },
      l: function claim(nodes) {
        throw new Error(
          "options.hydrate only works if the component was compiled with the `hydratable: true` option"
        );
      },
      m: function mount(target, anchor, remount) {
        insert_dev(target, div3, anchor);
        append_dev(div3, form);
        append_dev(form, div0);
        append_dev(div0, label0);
        append_dev(div0, t1);
        append_dev(div0, input0);
        set_input_value(input0, /*input*/ ctx[1].author.name);
        append_dev(div0, t2);
        if (if_block0) if_block0.m(div0, null);
        append_dev(form, t3);
        append_dev(form, div1);
        append_dev(div1, label1);
        append_dev(div1, t5);
        append_dev(div1, textarea);
        set_input_value(textarea, /*input*/ ctx[1].en);
        append_dev(div1, t6);
        if (if_block1) if_block1.m(div1, null);
        append_dev(form, t7);
        append_dev(form, div2);
        append_dev(div2, input1);
        input1.checked = /*showRating*/ ctx[2];
        append_dev(div2, t8);
        append_dev(div2, label2);
        append_dev(form, t10);
        if (if_block2) if_block2.m(form, null);
        append_dev(form, t11);
        append_dev(form, button0);
        insert_dev(target, t13, anchor);
        insert_dev(target, button1, anchor);
        insert_dev(target, t15, anchor);
        if (if_block3) if_block3.m(target, anchor);
        insert_dev(target, if_block3_anchor, anchor);
        current = true;
        if (remount) run_all(dispose);

        dispose = [
          listen_dev(input0, "input", /*input0_input_handler*/ ctx[12]),
          listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[13]),
          listen_dev(input1, "change", /*input1_change_handler*/ ctx[14]),
          listen_dev(
            form,
            "submit",
            prevent_default(/*handleSubmit*/ ctx[6]),
            false,
            true,
            false
          ),
          listen_dev(button1, "click", toggleModal, false, false, false),
        ];
      },
      p: function update(ctx, [dirty]) {
        if (
          !current ||
          (dirty & /*authorClass*/ 1 &&
            input0_class_value !==
              (input0_class_value = "form-control " + /*authorClass*/ ctx[0]))
        ) {
          attr_dev(input0, "class", input0_class_value);
        }

        if (
          dirty & /*input*/ 2 &&
          input0.value !== /*input*/ ctx[1].author.name
        ) {
          set_input_value(input0, /*input*/ ctx[1].author.name);
        }

        if (/*errors*/ ctx[3] !== null) {
          if (if_block0) {
            if_block0.p(ctx, dirty);
          } else {
            if_block0 = create_if_block_4(ctx);
            if_block0.c();
            if_block0.m(div0, null);
          }
        } else if (if_block0) {
          if_block0.d(1);
          if_block0 = null;
        }

        if (
          !current ||
          (dirty & /*quoteContentsClass*/ 16 &&
            textarea_class_value !==
              (textarea_class_value =
                "form-control " + /*quoteContentsClass*/ ctx[4]))
        ) {
          attr_dev(textarea, "class", textarea_class_value);
        }

        if (dirty & /*input*/ 2) {
          set_input_value(textarea, /*input*/ ctx[1].en);
        }

        if (/*errors*/ ctx[3] !== null) {
          if (if_block1) {
            if_block1.p(ctx, dirty);
          } else {
            if_block1 = create_if_block_2(ctx);
            if_block1.c();
            if_block1.m(div1, null);
          }
        } else if (if_block1) {
          if_block1.d(1);
          if_block1 = null;
        }

        if (dirty & /*showRating*/ 4) {
          input1.checked = /*showRating*/ ctx[2];
        }

        if (/*showRating*/ ctx[2]) {
          if (if_block2) {
            if_block2.p(ctx, dirty);
          } else {
            if_block2 = create_if_block_1$1(ctx);
            if_block2.c();
            if_block2.m(form, t11);
          }
        } else if (if_block2) {
          if_block2.d(1);
          if_block2 = null;
        }

        if (/*showModal*/ ctx[5]) if_block3.p(ctx, dirty);
      },
      i: function intro(local) {
        if (current) return;
        transition_in(if_block3);
        current = true;
      },
      o: function outro(local) {
        transition_out(if_block3);
        current = false;
      },
      d: function destroy(detaching) {
        if (detaching) detach_dev(div3);
        if (if_block0) if_block0.d();
        if (if_block1) if_block1.d();
        if (if_block2) if_block2.d();
        if (detaching) detach_dev(t13);
        if (detaching) detach_dev(button1);
        if (detaching) detach_dev(t15);
        if (if_block3) if_block3.d(detaching);
        if (detaching) detach_dev(if_block3_anchor);
        run_all(dispose);
      },
    };

    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_fragment$3.name,
      type: "component",
      source: "",
      ctx,
    });

    return block;
  }

  function instance$3($$self, $$props, $$invalidate) {
    let authorClass = "";
    let input;
    let showRating = false;
    let showModal = false;
    let errors = null;
    let quoteContentsClass = "";
    let fetchedQuote;
    resetInput();

    async function handleSubmit(event) {
      if (!validateInput()) {
        return;
      }

      await fetch("http://localhost:3000/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      resetForm();
    }

    async function handleClick() {
      fetchedQuote = await getRandomQuote_1();
      $$invalidate(1, (input.en = fetchedQuote.en), input);
      $$invalidate(1, (input.author.name = fetchedQuote.author.name), input);
    }

    function resetInput() {
      $$invalidate(1, (input = { en: "", author: { name: "" } }));
    }

    function resetForm() {
      resetInput();
      $$invalidate(2, (showRating = false));
      $$invalidate(3, (errors = null));
    }

    function validateInput() {
      $$invalidate(
        3,
        (errors = {
          name:
            input && input.author.name && input.author.name.trim() !== ""
              ? null
              : "Required field",
          quoteContents:
            input && input.en && input.en.trim() !== ""
              ? null
              : "Required field",
        })
      );

      return !Object.keys(errors).some((k) => errors[k] !== null);
    } // returns true if all valid; returns false if 1+ errors

    const writable_props = [];

    Object_1.keys($$props).forEach((key) => {
      if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$")
        console.warn(`<AddQuote> was created with unknown prop '${key}'`);
    });

    let { $$slots = {}, $$scope } = $$props;
    validate_slots("AddQuote", $$slots, []);

    function input0_input_handler() {
      input.author.name = this.value;
      ($$invalidate(1, input), $$invalidate(2, showRating)),
        $$invalidate(3, errors);
    }

    function textarea_input_handler() {
      input.en = this.value;
      ($$invalidate(1, input), $$invalidate(2, showRating)),
        $$invalidate(3, errors);
    }

    function input1_change_handler() {
      showRating = this.checked;
      $$invalidate(2, showRating);
    }

    function input_1_change_input_handler() {
      input.rating = to_number(this.value);
      ($$invalidate(1, input), $$invalidate(2, showRating)),
        $$invalidate(3, errors);
    }

    $$self.$capture_state = () => ({
      fly,
      fade,
      quintOut,
      getRandomQuote: getRandomQuote_1,
      authorClass,
      input,
      showRating,
      showModal,
      errors,
      quoteContentsClass,
      fetchedQuote,
      handleSubmit,
      handleClick,
      resetInput,
      resetForm,
      validateInput,
    });

    $$self.$inject_state = ($$props) => {
      if ("authorClass" in $$props)
        $$invalidate(0, (authorClass = $$props.authorClass));
      if ("input" in $$props) $$invalidate(1, (input = $$props.input));
      if ("showRating" in $$props)
        $$invalidate(2, (showRating = $$props.showRating));
      if ("showModal" in $$props)
        $$invalidate(5, (showModal = $$props.showModal));
      if ("errors" in $$props) $$invalidate(3, (errors = $$props.errors));
      if ("quoteContentsClass" in $$props)
        $$invalidate(4, (quoteContentsClass = $$props.quoteContentsClass));
      if ("fetchedQuote" in $$props) fetchedQuote = $$props.fetchedQuote;
    };

    if ($$props && "$$inject" in $$props) {
      $$self.$inject_state($$props.$$inject);
    }

    $$self.$$.update = () => {
      if ($$self.$$.dirty & /*showRating, errors*/ 12) {
        {
          showRating
            ? $$invalidate(1, (input.rating = 0), input)
            : $$invalidate(1, (input.rating = null), input);

          $$invalidate(
            0,
            (authorClass =
              errors !== null ? (errors.name ? "is-invalid" : "is-valid") : "")
          );

          $$invalidate(
            4,
            (quoteContentsClass =
              errors !== null
                ? errors.quoteContents
                  ? "is-invalid"
                  : "is-valid"
                : "")
          );
        }
      }
    };

    return [
      authorClass,
      input,
      showRating,
      errors,
      quoteContentsClass,
      showModal,
      handleSubmit,
      handleClick,
      fetchedQuote,
      resetInput,
      resetForm,
      validateInput,
      input0_input_handler,
      textarea_input_handler,
      input1_change_handler,
      input_1_change_input_handler,
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
        id: create_fragment$3.name,
      });
    }
  }

  async function fetchAuthors() {
    try {
      const res = await fetch("/api/authors");
      const authors = await res.json();
      return authors;
    } catch (error) {
      console.log(error);
    }
  }

  var fetchAuthors_1 = fetchAuthors;

  async function fetchRandomImg(num) {
    const url = `https://picsum.photos/v2/list?page=1&limit=${num}`;
    try {
      let images = await fetch(url);
      images = await images.json();
      return images;
    } catch (error) {
      console.log(error);
    }
  }

  var fetchRandomImg_1 = fetchRandomImg;

  function sortArrayByName(array) {
    const copyArray = [...array];

    // sort by name
    copyArray.sort(function (a, b) {
      var nameA = a.name.toUpperCase(); // ignore upper and lowercase
      var nameB = b.name.toUpperCase(); // ignore upper and lowercase
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }

      // names must be equal
      return 0;
    });
    return copyArray;
  }

  var sortArray = { sortArrayByName };
  var sortArray_1 = sortArray.sortArrayByName;

  /* src\client\components\AuthorCard.svelte generated by Svelte v3.20.1 */

  const { console: console_1 } = globals;
  const file$2 = "src\\client\\components\\AuthorCard.svelte";

  function create_fragment$4(ctx) {
    let div1;
    let img;
    let img_src_value;
    let t0;
    let div0;
    let h4;
    let t1_value = /*author*/ ctx[0].name + "";
    let t1;
    let t2;
    let button;
    let dispose;

    const block = {
      c: function create() {
        div1 = element("div");
        img = element("img");
        t0 = space();
        div0 = element("div");
        h4 = element("h4");
        t1 = text(t1_value);
        t2 = space();
        button = element("button");
        button.textContent = "See Quotes";
        attr_dev(img, "class", "card-img-top img-fluid");
        if (img.src !== (img_src_value = /*image*/ ctx[1].download_url))
          attr_dev(img, "src", img_src_value);
        attr_dev(img, "alt", "Card image");
        add_location(img, file$2, 25, 2, 496);
        attr_dev(h4, "class", "card-title");
        add_location(h4, file$2, 30, 4, 624);
        attr_dev(button, "class", "btn btn-primary text-light");
        add_location(button, file$2, 31, 4, 671);
        attr_dev(div0, "class", "card-body");
        add_location(div0, file$2, 29, 2, 595);
        attr_dev(div1, "class", "card bg-light text-dark");
        add_location(div1, file$2, 24, 0, 455);
      },
      l: function claim(nodes) {
        throw new Error(
          "options.hydrate only works if the component was compiled with the `hydratable: true` option"
        );
      },
      m: function mount(target, anchor, remount) {
        insert_dev(target, div1, anchor);
        append_dev(div1, img);
        append_dev(div1, t0);
        append_dev(div1, div0);
        append_dev(div0, h4);
        append_dev(h4, t1);
        append_dev(div0, t2);
        append_dev(div0, button);
        if (remount) dispose();
        dispose = listen_dev(
          button,
          "click",
          /*handleClick*/ ctx[2],
          false,
          false,
          false
        );
      },
      p: function update(ctx, [dirty]) {
        if (
          dirty & /*image*/ 2 &&
          img.src !== (img_src_value = /*image*/ ctx[1].download_url)
        ) {
          attr_dev(img, "src", img_src_value);
        }

        if (
          dirty & /*author*/ 1 &&
          t1_value !== (t1_value = /*author*/ ctx[0].name + "")
        )
          set_data_dev(t1, t1_value);
      },
      i: noop,
      o: noop,
      d: function destroy(detaching) {
        if (detaching) detach_dev(div1);
        dispose();
      },
    };

    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_fragment$4.name,
      type: "component",
      source: "",
      ctx,
    });

    return block;
  }

  function instance$4($$self, $$props, $$invalidate) {
    let { author } = $$props;
    let { image } = $$props;

    async function getAuthorQuotes() {
      try {
        let quoteData = await fetch(`/api/quotes?authorId=${author.id}`);
        quoteData = await quoteData.json();
        return quoteData;
      } catch (error) {
        console.log(error);
      }
    }

    async function handleClick() {
      const quotes = await getAuthorQuotes();
      console.log(quotes);
    }

    const writable_props = ["author", "image"];

    Object.keys($$props).forEach((key) => {
      if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$")
        console_1.warn(`<AuthorCard> was created with unknown prop '${key}'`);
    });

    let { $$slots = {}, $$scope } = $$props;
    validate_slots("AuthorCard", $$slots, []);

    $$self.$set = ($$props) => {
      if ("author" in $$props) $$invalidate(0, (author = $$props.author));
      if ("image" in $$props) $$invalidate(1, (image = $$props.image));
    };

    $$self.$capture_state = () => ({
      author,
      image,
      getAuthorQuotes,
      handleClick,
    });

    $$self.$inject_state = ($$props) => {
      if ("author" in $$props) $$invalidate(0, (author = $$props.author));
      if ("image" in $$props) $$invalidate(1, (image = $$props.image));
    };

    if ($$props && "$$inject" in $$props) {
      $$self.$inject_state($$props.$$inject);
    }

    return [author, image, handleClick];
  }

  class AuthorCard extends SvelteComponentDev {
    constructor(options) {
      super(options);
      init(this, options, instance$4, create_fragment$4, safe_not_equal, {
        author: 0,
        image: 1,
      });

      dispatch_dev("SvelteRegisterComponent", {
        component: this,
        tagName: "AuthorCard",
        options,
        id: create_fragment$4.name,
      });

      const { ctx } = this.$$;
      const props = options.props || {};

      if (/*author*/ ctx[0] === undefined && !("author" in props)) {
        console_1.warn(
          "<AuthorCard> was created without expected prop 'author'"
        );
      }

      if (/*image*/ ctx[1] === undefined && !("image" in props)) {
        console_1.warn(
          "<AuthorCard> was created without expected prop 'image'"
        );
      }
    }

    get author() {
      throw new Error(
        "<AuthorCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
      );
    }

    set author(value) {
      throw new Error(
        "<AuthorCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
      );
    }

    get image() {
      throw new Error(
        "<AuthorCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
      );
    }

    set image(value) {
      throw new Error(
        "<AuthorCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
      );
    }
  }

  /* src\client\routes\Authors.svelte generated by Svelte v3.20.1 */
  const file$3 = "src\\client\\routes\\Authors.svelte";

  function get_each_context(ctx, list, i) {
    const child_ctx = ctx.slice();
    child_ctx[3] = list[i];
    child_ctx[5] = i;
    return child_ctx;
  }

  // (30:2) {#each authors as author, i}
  function create_each_block(ctx) {
    let current;

    const authorcard = new AuthorCard({
      props: {
        author: /*author*/ ctx[3],
        image: /*images*/ ctx[1][/*i*/ ctx[5]],
      },
      $$inline: true,
    });

    const block = {
      c: function create() {
        create_component(authorcard.$$.fragment);
      },
      m: function mount(target, anchor) {
        mount_component(authorcard, target, anchor);
        current = true;
      },
      p: function update(ctx, dirty) {
        const authorcard_changes = {};
        if (dirty & /*authors*/ 1)
          authorcard_changes.author = /*author*/ ctx[3];
        if (dirty & /*images*/ 2)
          authorcard_changes.image = /*images*/ ctx[1][/*i*/ ctx[5]];
        authorcard.$set(authorcard_changes);
      },
      i: function intro(local) {
        if (current) return;
        transition_in(authorcard.$$.fragment, local);
        current = true;
      },
      o: function outro(local) {
        transition_out(authorcard.$$.fragment, local);
        current = false;
      },
      d: function destroy(detaching) {
        destroy_component(authorcard, detaching);
      },
    };

    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_each_block.name,
      type: "each",
      source: "(30:2) {#each authors as author, i}",
      ctx,
    });

    return block;
  }

  function create_fragment$5(ctx) {
    let div;
    let current;
    let each_value = /*authors*/ ctx[0];
    validate_each_argument(each_value);
    let each_blocks = [];

    for (let i = 0; i < each_value.length; i += 1) {
      each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    }

    const out = (i) =>
      transition_out(each_blocks[i], 1, 1, () => {
        each_blocks[i] = null;
      });

    const block = {
      c: function create() {
        div = element("div");

        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].c();
        }

        attr_dev(div, "class", "card-columns mt-2");
        add_location(div, file$3, 27, 0, 668);
      },
      l: function claim(nodes) {
        throw new Error(
          "options.hydrate only works if the component was compiled with the `hydratable: true` option"
        );
      },
      m: function mount(target, anchor) {
        insert_dev(target, div, anchor);

        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].m(div, null);
        }

        current = true;
      },
      p: function update(ctx, [dirty]) {
        if (dirty & /*authors, images*/ 3) {
          each_value = /*authors*/ ctx[0];
          validate_each_argument(each_value);
          let i;

          for (i = 0; i < each_value.length; i += 1) {
            const child_ctx = get_each_context(ctx, each_value, i);

            if (each_blocks[i]) {
              each_blocks[i].p(child_ctx, dirty);
              transition_in(each_blocks[i], 1);
            } else {
              each_blocks[i] = create_each_block(child_ctx);
              each_blocks[i].c();
              transition_in(each_blocks[i], 1);
              each_blocks[i].m(div, null);
            }
          }

          group_outros();

          for (i = each_value.length; i < each_blocks.length; i += 1) {
            out(i);
          }

          check_outros();
        }
      },
      i: function intro(local) {
        if (current) return;

        for (let i = 0; i < each_value.length; i += 1) {
          transition_in(each_blocks[i]);
        }

        current = true;
      },
      o: function outro(local) {
        each_blocks = each_blocks.filter(Boolean);

        for (let i = 0; i < each_blocks.length; i += 1) {
          transition_out(each_blocks[i]);
        }

        current = false;
      },
      d: function destroy(detaching) {
        if (detaching) detach_dev(div);
        destroy_each(each_blocks, detaching);
      },
    };

    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_fragment$5.name,
      type: "component",
      source: "",
      ctx,
    });

    return block;
  }

  function instance$5($$self, $$props, $$invalidate) {
    let authors = [];
    let images = [];

    async function getAuthors() {
      let authorData = await fetchAuthors_1();
      let imageData = await fetchRandomImg_1(authorData.length); // store actual photos in the future

      // alphabetize authors
      authorData = sortArray_1(authorData);

      $$invalidate(0, (authors = authorData));
      $$invalidate(1, (images = imageData));
    }

    getAuthors();
    const writable_props = [];

    Object.keys($$props).forEach((key) => {
      if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$")
        console.warn(`<Authors> was created with unknown prop '${key}'`);
    });

    let { $$slots = {}, $$scope } = $$props;
    validate_slots("Authors", $$slots, []);

    $$self.$capture_state = () => ({
      fetchAuthors: fetchAuthors_1,
      fetchRandomImg: fetchRandomImg_1,
      sortArrayByName: sortArray_1,
      AuthorCard,
      authors,
      images,
      getAuthors,
    });

    $$self.$inject_state = ($$props) => {
      if ("authors" in $$props) $$invalidate(0, (authors = $$props.authors));
      if ("images" in $$props) $$invalidate(1, (images = $$props.images));
    };

    if ($$props && "$$inject" in $$props) {
      $$self.$inject_state($$props.$$inject);
    }

    return [authors, images];
  }

  class Authors extends SvelteComponentDev {
    constructor(options) {
      super(options);
      init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

      dispatch_dev("SvelteRegisterComponent", {
        component: this,
        tagName: "Authors",
        options,
        id: create_fragment$5.name,
      });
    }
  }

  /* src\client\routes\GenerateQuote.svelte generated by Svelte v3.20.1 */
  const file$4 = "src\\client\\routes\\GenerateQuote.svelte";

  // (26:2) {#if showQuote}
  function create_if_block$2(ctx) {
    let div;
    let h1;
    let t0_value = /*quote*/ ctx[0].author.name + "";
    let t0;
    let t1;
    let p;
    let t2_value = /*quote*/ ctx[0].en + "";
    let t2;

    const block = {
      c: function create() {
        div = element("div");
        h1 = element("h1");
        t0 = text(t0_value);
        t1 = space();
        p = element("p");
        t2 = text(t2_value);
        add_location(h1, file$4, 27, 6, 589);
        add_location(p, file$4, 28, 6, 625);
        attr_dev(div, "class", "jumbotron mt-3");
        add_location(div, file$4, 26, 4, 553);
      },
      m: function mount(target, anchor) {
        insert_dev(target, div, anchor);
        append_dev(div, h1);
        append_dev(h1, t0);
        append_dev(div, t1);
        append_dev(div, p);
        append_dev(p, t2);
      },
      p: function update(ctx, dirty) {
        if (
          dirty & /*quote*/ 1 &&
          t0_value !== (t0_value = /*quote*/ ctx[0].author.name + "")
        )
          set_data_dev(t0, t0_value);
        if (
          dirty & /*quote*/ 1 &&
          t2_value !== (t2_value = /*quote*/ ctx[0].en + "")
        )
          set_data_dev(t2, t2_value);
      },
      d: function destroy(detaching) {
        if (detaching) detach_dev(div);
      },
    };

    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_if_block$2.name,
      type: "if",
      source: "(26:2) {#if showQuote}",
      ctx,
    });

    return block;
  }

  function create_fragment$6(ctx) {
    let div;
    let button;
    let t1;
    let dispose;
    let if_block = /*showQuote*/ ctx[1] && create_if_block$2(ctx);

    const block = {
      c: function create() {
        div = element("div");
        button = element("button");
        button.textContent = "Generate Random Quote";
        t1 = space();
        if (if_block) if_block.c();
        attr_dev(button, "class", "btn btn-primary btn-block btn-lg");
        add_location(button, file$4, 21, 2, 414);
        attr_dev(div, "class", "generate-quote pt-4");
        add_location(div, file$4, 19, 0, 375);
      },
      l: function claim(nodes) {
        throw new Error(
          "options.hydrate only works if the component was compiled with the `hydratable: true` option"
        );
      },
      m: function mount(target, anchor, remount) {
        insert_dev(target, div, anchor);
        append_dev(div, button);
        append_dev(div, t1);
        if (if_block) if_block.m(div, null);
        if (remount) dispose();
        dispose = listen_dev(
          button,
          "click",
          /*handleClick*/ ctx[2],
          false,
          false,
          false
        );
      },
      p: function update(ctx, [dirty]) {
        if (/*showQuote*/ ctx[1]) {
          if (if_block) {
            if_block.p(ctx, dirty);
          } else {
            if_block = create_if_block$2(ctx);
            if_block.c();
            if_block.m(div, null);
          }
        } else if (if_block) {
          if_block.d(1);
          if_block = null;
        }
      },
      i: noop,
      o: noop,
      d: function destroy(detaching) {
        if (detaching) detach_dev(div);
        if (if_block) if_block.d();
        dispose();
      },
    };

    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_fragment$6.name,
      type: "component",
      source: "",
      ctx,
    });

    return block;
  }

  function instance$6($$self, $$props, $$invalidate) {
    let quote = {};
    let showQuote = false;

    async function handleClick() {
      const data = await getRandomQuote_1();
      $$invalidate(0, (quote = data)); // set quote after so pending promise data doesn't show in UI

      if (!showQuote) {
        $$invalidate(1, (showQuote = true));
      }
    }

    const writable_props = [];

    Object.keys($$props).forEach((key) => {
      if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$")
        console.warn(`<GenerateQuote> was created with unknown prop '${key}'`);
    });

    let { $$slots = {}, $$scope } = $$props;
    validate_slots("GenerateQuote", $$slots, []);

    $$self.$capture_state = () => ({
      getRandomQuote: getRandomQuote_1,
      quote,
      showQuote,
      handleClick,
    });

    $$self.$inject_state = ($$props) => {
      if ("quote" in $$props) $$invalidate(0, (quote = $$props.quote));
      if ("showQuote" in $$props)
        $$invalidate(1, (showQuote = $$props.showQuote));
    };

    if ($$props && "$$inject" in $$props) {
      $$self.$inject_state($$props.$$inject);
    }

    return [quote, showQuote, handleClick];
  }

  class GenerateQuote extends SvelteComponentDev {
    constructor(options) {
      super(options);
      init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

      dispatch_dev("SvelteRegisterComponent", {
        component: this,
        tagName: "GenerateQuote",
        options,
        id: create_fragment$6.name,
      });
    }
  }

  /* src\client\components\ExpandAllMenu.svelte generated by Svelte v3.20.1 */

  const file$5 = "src\\client\\components\\ExpandAllMenu.svelte";

  function create_fragment$7(ctx) {
    let div;
    let select;
    let option0;
    let option0_value_value;
    let option1;
    let option1_value_value;
    let dispose;

    const block = {
      c: function create() {
        div = element("div");
        select = element("select");
        option0 = element("option");
        option0.textContent = "Expand All";
        option1 = element("option");
        option1.textContent = "Collapse All";
        option0.__value = option0_value_value = true;
        option0.value = option0.__value;
        add_location(option0, file$5, 10, 4, 167);
        option1.__value = option1_value_value = false;
        option1.value = option1.__value;
        add_location(option1, file$5, 11, 4, 213);
        attr_dev(select, "class", "form-control text-muted");
        if (/*expanded*/ ctx[0] === void 0)
          add_render_callback(() =>
            /*select_change_handler*/ ctx[1].call(select)
          );
        add_location(select, file$5, 9, 2, 99);
        attr_dev(div, "class", "form-inline");
        add_location(div, file$5, 8, 0, 70);
      },
      l: function claim(nodes) {
        throw new Error(
          "options.hydrate only works if the component was compiled with the `hydratable: true` option"
        );
      },
      m: function mount(target, anchor, remount) {
        insert_dev(target, div, anchor);
        append_dev(div, select);
        append_dev(select, option0);
        append_dev(select, option1);
        select_option(select, /*expanded*/ ctx[0]);
        if (remount) dispose();
        dispose = listen_dev(
          select,
          "change",
          /*select_change_handler*/ ctx[1]
        );
      },
      p: function update(ctx, [dirty]) {
        if (dirty & /*expanded*/ 1) {
          select_option(select, /*expanded*/ ctx[0]);
        }
      },
      i: noop,
      o: noop,
      d: function destroy(detaching) {
        if (detaching) detach_dev(div);
        dispose();
      },
    };

    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_fragment$7.name,
      type: "component",
      source: "",
      ctx,
    });

    return block;
  }

  function instance$7($$self, $$props, $$invalidate) {
    let { expanded } = $$props;
    const writable_props = ["expanded"];

    Object.keys($$props).forEach((key) => {
      if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$")
        console.warn(`<ExpandAllMenu> was created with unknown prop '${key}'`);
    });

    let { $$slots = {}, $$scope } = $$props;
    validate_slots("ExpandAllMenu", $$slots, []);

    function select_change_handler() {
      expanded = select_value(this);
      $$invalidate(0, expanded);
    }

    $$self.$set = ($$props) => {
      if ("expanded" in $$props) $$invalidate(0, (expanded = $$props.expanded));
    };

    $$self.$capture_state = () => ({ expanded });

    $$self.$inject_state = ($$props) => {
      if ("expanded" in $$props) $$invalidate(0, (expanded = $$props.expanded));
    };

    if ($$props && "$$inject" in $$props) {
      $$self.$inject_state($$props.$$inject);
    }

    return [expanded, select_change_handler];
  }

  class ExpandAllMenu extends SvelteComponentDev {
    constructor(options) {
      super(options);
      init(this, options, instance$7, create_fragment$7, safe_not_equal, {
        expanded: 0,
      });

      dispatch_dev("SvelteRegisterComponent", {
        component: this,
        tagName: "ExpandAllMenu",
        options,
        id: create_fragment$7.name,
      });

      const { ctx } = this.$$;
      const props = options.props || {};

      if (/*expanded*/ ctx[0] === undefined && !("expanded" in props)) {
        console.warn(
          "<ExpandAllMenu> was created without expected prop 'expanded'"
        );
      }
    }

    get expanded() {
      throw new Error(
        "<ExpandAllMenu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
      );
    }

    set expanded(value) {
      throw new Error(
        "<ExpandAllMenu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
      );
    }
  }

  /* src\client\components\LanguageDropdown.svelte generated by Svelte v3.20.1 */

  const file$6 = "src\\client\\components\\LanguageDropdown.svelte";

  function get_each_context$1(ctx, list, i) {
    const child_ctx = ctx.slice();
    child_ctx[3] = list[i];
    return child_ctx;
  }

  // (8:4) {#each languages as lang}
  function create_each_block$1(ctx) {
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
        add_location(option, file$6, 8, 6, 218);
      },
      m: function mount(target, anchor) {
        insert_dev(target, option, anchor);
        append_dev(option, t);
      },
      p: function update(ctx, dirty) {
        if (
          dirty & /*languages*/ 2 &&
          t_value !== (t_value = /*lang*/ ctx[3].label + "")
        )
          set_data_dev(t, t_value);

        if (
          dirty & /*languages*/ 2 &&
          option_value_value !== (option_value_value = /*lang*/ ctx[3].code)
        ) {
          prop_dev(option, "__value", option_value_value);
        }

        option.value = option.__value;
      },
      d: function destroy(detaching) {
        if (detaching) detach_dev(option);
      },
    };

    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_each_block$1.name,
      type: "each",
      source: "(8:4) {#each languages as lang}",
      ctx,
    });

    return block;
  }

  function create_fragment$8(ctx) {
    let div;
    let select;
    let dispose;
    let each_value = /*languages*/ ctx[1];
    validate_each_argument(each_value);
    let each_blocks = [];

    for (let i = 0; i < each_value.length; i += 1) {
      each_blocks[i] = create_each_block$1(
        get_each_context$1(ctx, each_value, i)
      );
    }

    const block = {
      c: function create() {
        div = element("div");
        select = element("select");

        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].c();
        }

        attr_dev(select, "class", "form-control text-muted");
        if (/*selectedLanguage*/ ctx[0] === void 0)
          add_render_callback(() =>
            /*select_change_handler*/ ctx[2].call(select)
          );
        add_location(select, file$6, 6, 2, 109);
        attr_dev(div, "class", "form-inline");
        add_location(div, file$6, 5, 0, 80);
      },
      l: function claim(nodes) {
        throw new Error(
          "options.hydrate only works if the component was compiled with the `hydratable: true` option"
        );
      },
      m: function mount(target, anchor, remount) {
        insert_dev(target, div, anchor);
        append_dev(div, select);

        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].m(select, null);
        }

        select_option(select, /*selectedLanguage*/ ctx[0]);
        if (remount) dispose();
        dispose = listen_dev(
          select,
          "change",
          /*select_change_handler*/ ctx[2]
        );
      },
      p: function update(ctx, [dirty]) {
        if (dirty & /*languages*/ 2) {
          each_value = /*languages*/ ctx[1];
          validate_each_argument(each_value);
          let i;

          for (i = 0; i < each_value.length; i += 1) {
            const child_ctx = get_each_context$1(ctx, each_value, i);

            if (each_blocks[i]) {
              each_blocks[i].p(child_ctx, dirty);
            } else {
              each_blocks[i] = create_each_block$1(child_ctx);
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
      },
    };

    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_fragment$8.name,
      type: "component",
      source: "",
      ctx,
    });

    return block;
  }

  function instance$8($$self, $$props, $$invalidate) {
    let { languages } = $$props;
    let { selectedLanguage } = $$props;
    const writable_props = ["languages", "selectedLanguage"];

    Object.keys($$props).forEach((key) => {
      if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$")
        console.warn(
          `<LanguageDropdown> was created with unknown prop '${key}'`
        );
    });

    let { $$slots = {}, $$scope } = $$props;
    validate_slots("LanguageDropdown", $$slots, []);

    function select_change_handler() {
      selectedLanguage = select_value(this);
      $$invalidate(0, selectedLanguage);
      $$invalidate(1, languages);
    }

    $$self.$set = ($$props) => {
      if ("languages" in $$props)
        $$invalidate(1, (languages = $$props.languages));
      if ("selectedLanguage" in $$props)
        $$invalidate(0, (selectedLanguage = $$props.selectedLanguage));
    };

    $$self.$capture_state = () => ({ languages, selectedLanguage });

    $$self.$inject_state = ($$props) => {
      if ("languages" in $$props)
        $$invalidate(1, (languages = $$props.languages));
      if ("selectedLanguage" in $$props)
        $$invalidate(0, (selectedLanguage = $$props.selectedLanguage));
    };

    if ($$props && "$$inject" in $$props) {
      $$self.$inject_state($$props.$$inject);
    }

    return [selectedLanguage, languages, select_change_handler];
  }

  class LanguageDropdown extends SvelteComponentDev {
    constructor(options) {
      super(options);
      init(this, options, instance$8, create_fragment$8, safe_not_equal, {
        languages: 1,
        selectedLanguage: 0,
      });

      dispatch_dev("SvelteRegisterComponent", {
        component: this,
        tagName: "LanguageDropdown",
        options,
        id: create_fragment$8.name,
      });

      const { ctx } = this.$$;
      const props = options.props || {};

      if (/*languages*/ ctx[1] === undefined && !("languages" in props)) {
        console.warn(
          "<LanguageDropdown> was created without expected prop 'languages'"
        );
      }

      if (
        /*selectedLanguage*/ ctx[0] === undefined &&
        !("selectedLanguage" in props)
      ) {
        console.warn(
          "<LanguageDropdown> was created without expected prop 'selectedLanguage'"
        );
      }
    }

    get languages() {
      throw new Error(
        "<LanguageDropdown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
      );
    }

    set languages(value) {
      throw new Error(
        "<LanguageDropdown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
      );
    }

    get selectedLanguage() {
      throw new Error(
        "<LanguageDropdown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
      );
    }

    set selectedLanguage(value) {
      throw new Error(
        "<LanguageDropdown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
      );
    }
  }

  /* src\client\components\LongText.svelte generated by Svelte v3.20.1 */

  const file$7 = "src\\client\\components\\LongText.svelte";

  // (19:0) {:else}
  function create_else_block$2(ctx) {
    let t0;
    let t1;
    let t2;
    let a;
    let dispose;

    const block = {
      c: function create() {
        t0 = text('"');
        t1 = text(/*textShort*/ ctx[2]);
        t2 = text('..."\r\n ');
        a = element("a");
        a.textContent = "Show more";
        attr_dev(a, "href", "/");
        add_location(a, file$7, 20, 1, 383);
      },
      m: function mount(target, anchor, remount) {
        insert_dev(target, t0, anchor);
        insert_dev(target, t1, anchor);
        insert_dev(target, t2, anchor);
        insert_dev(target, a, anchor);
        if (remount) dispose();
        dispose = listen_dev(
          a,
          "click",
          prevent_default(/*toggleExpanded*/ ctx[3]),
          false,
          true,
          false
        );
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
      },
    };

    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_else_block$2.name,
      type: "else",
      source: "(19:0) {:else}",
      ctx,
    });

    return block;
  }

  // (16:19)
  function create_if_block_1$2(ctx) {
    let t0;
    let t1;
    let t2;
    let a;
    let dispose;

    const block = {
      c: function create() {
        t0 = text('"');
        t1 = text(/*text*/ ctx[1]);
        t2 = text('"\r\n\t');
        a = element("a");
        a.textContent = "Show less";
        attr_dev(a, "href", "/");
        add_location(a, file$7, 17, 1, 286);
      },
      m: function mount(target, anchor, remount) {
        insert_dev(target, t0, anchor);
        insert_dev(target, t1, anchor);
        insert_dev(target, t2, anchor);
        insert_dev(target, a, anchor);
        if (remount) dispose();
        dispose = listen_dev(
          a,
          "click",
          prevent_default(/*toggleExpanded*/ ctx[3]),
          false,
          true,
          false
        );
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
      },
    };

    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_if_block_1$2.name,
      type: "if",
      source: "(16:19) ",
      ctx,
    });

    return block;
  }

  // (14:0) {#if text === textShort}
  function create_if_block$3(ctx) {
    let t0;
    let t1;
    let t2;

    const block = {
      c: function create() {
        t0 = text('"');
        t1 = text(/*text*/ ctx[1]);
        t2 = text('"');
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
      },
    };

    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_if_block$3.name,
      type: "if",
      source: "(14:0) {#if text === textShort}",
      ctx,
    });

    return block;
  }

  function create_fragment$9(ctx) {
    let if_block_anchor;

    function select_block_type(ctx, dirty) {
      if (/*text*/ ctx[1] === /*textShort*/ ctx[2]) return create_if_block$3;
      if (/*expanded*/ ctx[0]) return create_if_block_1$2;
      return create_else_block$2;
    }

    let current_block_type = select_block_type(ctx);
    let if_block = current_block_type(ctx);

    const block = {
      c: function create() {
        if_block.c();
        if_block_anchor = empty();
      },
      l: function claim(nodes) {
        throw new Error(
          "options.hydrate only works if the component was compiled with the `hydratable: true` option"
        );
      },
      m: function mount(target, anchor) {
        if_block.m(target, anchor);
        insert_dev(target, if_block_anchor, anchor);
      },
      p: function update(ctx, [dirty]) {
        if (
          current_block_type ===
            (current_block_type = select_block_type(ctx)) &&
          if_block
        ) {
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
      },
    };

    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_fragment$9.name,
      type: "component",
      source: "",
      ctx,
    });

    return block;
  }

  function instance$9($$self, $$props, $$invalidate) {
    let { text } = $$props;
    let { expanded = false } = $$props;
    let { wordLimit = 25 } = $$props;

    function toggleExpanded() {
      $$invalidate(0, (expanded = !expanded));
    }

    const writable_props = ["text", "expanded", "wordLimit"];

    Object.keys($$props).forEach((key) => {
      if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$")
        console.warn(`<LongText> was created with unknown prop '${key}'`);
    });

    let { $$slots = {}, $$scope } = $$props;
    validate_slots("LongText", $$slots, []);

    $$self.$set = ($$props) => {
      if ("text" in $$props) $$invalidate(1, (text = $$props.text));
      if ("expanded" in $$props) $$invalidate(0, (expanded = $$props.expanded));
      if ("wordLimit" in $$props)
        $$invalidate(4, (wordLimit = $$props.wordLimit));
    };

    $$self.$capture_state = () => ({
      text,
      expanded,
      wordLimit,
      toggleExpanded,
      textShort,
    });

    $$self.$inject_state = ($$props) => {
      if ("text" in $$props) $$invalidate(1, (text = $$props.text));
      if ("expanded" in $$props) $$invalidate(0, (expanded = $$props.expanded));
      if ("wordLimit" in $$props)
        $$invalidate(4, (wordLimit = $$props.wordLimit));
      if ("textShort" in $$props)
        $$invalidate(2, (textShort = $$props.textShort));
    };

    let textShort;

    if ($$props && "$$inject" in $$props) {
      $$self.$inject_state($$props.$$inject);
    }

    $$self.$$.update = () => {
      if ($$self.$$.dirty & /*text, wordLimit*/ 18) {
        $$invalidate(
          2,
          (textShort = text.split(" ").slice(0, wordLimit).join(" "))
        );
      }
    };

    return [expanded, text, textShort, toggleExpanded, wordLimit];
  }

  class LongText extends SvelteComponentDev {
    constructor(options) {
      super(options);
      init(this, options, instance$9, create_fragment$9, safe_not_equal, {
        text: 1,
        expanded: 0,
        wordLimit: 4,
      });

      dispatch_dev("SvelteRegisterComponent", {
        component: this,
        tagName: "LongText",
        options,
        id: create_fragment$9.name,
      });

      const { ctx } = this.$$;
      const props = options.props || {};

      if (/*text*/ ctx[1] === undefined && !("text" in props)) {
        console.warn("<LongText> was created without expected prop 'text'");
      }
    }

    get text() {
      throw new Error(
        "<LongText>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
      );
    }

    set text(value) {
      throw new Error(
        "<LongText>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
      );
    }

    get expanded() {
      throw new Error(
        "<LongText>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
      );
    }

    set expanded(value) {
      throw new Error(
        "<LongText>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
      );
    }

    get wordLimit() {
      throw new Error(
        "<LongText>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
      );
    }

    set wordLimit(value) {
      throw new Error(
        "<LongText>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
      );
    }
  }

  /* src\client\components\Rating.svelte generated by Svelte v3.20.1 */

  const file$8 = "src\\client\\components\\Rating.svelte";

  function get_each_context$2(ctx, list, i) {
    const child_ctx = ctx.slice();
    child_ctx[1] = list[i];
    return child_ctx;
  }

  // (29:0) {#each determineStars(rating) as star}
  function create_each_block$2(ctx) {
    let span;
    let span_class_value;

    const block = {
      c: function create() {
        span = element("span");
        attr_dev(
          span,
          "class",
          (span_class_value =
            "star fa fa-star" +
            (!(/*star*/ ctx[1].full) ? "-half-o" : "") +
            " " +
            /*star*/ (ctx[1].checked ? "checked" : "") +
            " svelte-67m09p")
        );
        add_location(span, file$8, 29, 1, 459);
      },
      m: function mount(target, anchor) {
        insert_dev(target, span, anchor);
      },
      p: function update(ctx, dirty) {
        if (
          dirty & /*rating*/ 1 &&
          span_class_value !==
            (span_class_value =
              "star fa fa-star" +
              (!(/*star*/ ctx[1].full) ? "-half-o" : "") +
              " " +
              /*star*/ (ctx[1].checked ? "checked" : "") +
              " svelte-67m09p")
        ) {
          attr_dev(span, "class", span_class_value);
        }
      },
      d: function destroy(detaching) {
        if (detaching) detach_dev(span);
      },
    };

    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_each_block$2.name,
      type: "each",
      source: "(29:0) {#each determineStars(rating) as star}",
      ctx,
    });

    return block;
  }

  function create_fragment$a(ctx) {
    let each_1_anchor;
    let each_value = determineStars(/*rating*/ ctx[0]);
    validate_each_argument(each_value);
    let each_blocks = [];

    for (let i = 0; i < each_value.length; i += 1) {
      each_blocks[i] = create_each_block$2(
        get_each_context$2(ctx, each_value, i)
      );
    }

    const block = {
      c: function create() {
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].c();
        }

        each_1_anchor = empty();
      },
      l: function claim(nodes) {
        throw new Error(
          "options.hydrate only works if the component was compiled with the `hydratable: true` option"
        );
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
            const child_ctx = get_each_context$2(ctx, each_value, i);

            if (each_blocks[i]) {
              each_blocks[i].p(child_ctx, dirty);
            } else {
              each_blocks[i] = create_each_block$2(child_ctx);
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
      },
    };

    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_fragment$a.name,
      type: "component",
      source: "",
      ctx,
    });

    return block;
  }

  function determineStars(rating) {
    const ratingRounded = Math.round(rating * 2) / 2;
    let starArray = [];

    for (let i = 1; i <= 5; i++) {
      starArray.push({
        full: ratingRounded - i !== -0.5,
        checked: ratingRounded > i - 1,
      });
    }

    return starArray;
  }

  function instance$a($$self, $$props, $$invalidate) {
    let { rating } = $$props;
    const writable_props = ["rating"];

    Object.keys($$props).forEach((key) => {
      if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$")
        console.warn(`<Rating> was created with unknown prop '${key}'`);
    });

    let { $$slots = {}, $$scope } = $$props;
    validate_slots("Rating", $$slots, []);

    $$self.$set = ($$props) => {
      if ("rating" in $$props) $$invalidate(0, (rating = $$props.rating));
    };

    $$self.$capture_state = () => ({ rating, determineStars });

    $$self.$inject_state = ($$props) => {
      if ("rating" in $$props) $$invalidate(0, (rating = $$props.rating));
    };

    if ($$props && "$$inject" in $$props) {
      $$self.$inject_state($$props.$$inject);
    }

    return [rating];
  }

  class Rating extends SvelteComponentDev {
    constructor(options) {
      super(options);
      init(this, options, instance$a, create_fragment$a, safe_not_equal, {
        rating: 0,
      });

      dispatch_dev("SvelteRegisterComponent", {
        component: this,
        tagName: "Rating",
        options,
        id: create_fragment$a.name,
      });

      const { ctx } = this.$$;
      const props = options.props || {};

      if (/*rating*/ ctx[0] === undefined && !("rating" in props)) {
        console.warn("<Rating> was created without expected prop 'rating'");
      }
    }

    get rating() {
      throw new Error(
        "<Rating>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
      );
    }

    set rating(value) {
      throw new Error(
        "<Rating>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
      );
    }
  }

  /* src\client\components\Quote.svelte generated by Svelte v3.20.1 */

  const { console: console_1$1 } = globals;
  const file$9 = "src\\client\\components\\Quote.svelte";

  // (55:2) {#if quote.rating !== null}
  function create_if_block$4(ctx) {
    let div;
    let current;

    const rating = new Rating({
      props: { rating: /*quote*/ ctx[0].rating },
      $$inline: true,
    });

    const block = {
      c: function create() {
        div = element("div");
        create_component(rating.$$.fragment);
        attr_dev(div, "class", "rating svelte-niz1n");
        add_location(div, file$9, 55, 4, 1054);
      },
      m: function mount(target, anchor) {
        insert_dev(target, div, anchor);
        mount_component(rating, div, null);
        current = true;
      },
      p: function update(ctx, dirty) {
        const rating_changes = {};
        if (dirty & /*quote*/ 1)
          rating_changes.rating = /*quote*/ ctx[0].rating;
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
      },
    };

    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_if_block$4.name,
      type: "if",
      source: "(55:2) {#if quote.rating !== null}",
      ctx,
    });

    return block;
  }

  function create_fragment$b(ctx) {
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
    let div2_transition;
    let current;
    let dispose;

    const longtext = new LongText({
      props: {
        text: /*quote*/ ctx[0][/*selectedLanguage*/ ctx[1]],
        expanded: /*expanded*/ ctx[2],
      },
      $$inline: true,
    });

    let if_block = /*quote*/ ctx[0].rating !== null && create_if_block$4(ctx);

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
        attr_dev(div0, "class", "author svelte-niz1n");
        add_location(div0, file$9, 48, 2, 866);
        attr_dev(div1, "class", "quote-contents svelte-niz1n");
        add_location(div1, file$9, 50, 2, 917);
        attr_dev(i, "class", "fa fa-trash");
        add_location(i, file$9, 61, 4, 1197);
        attr_dev(a, "href", "/");
        add_location(a, file$9, 60, 2, 1141);
        attr_dev(div2, "class", "quote svelte-niz1n");
        attr_dev(div2, "id", (div2_id_value = /*quote*/ ctx[0].id));
        add_location(div2, file$9, 46, 0, 805);
      },
      l: function claim(nodes) {
        throw new Error(
          "options.hydrate only works if the component was compiled with the `hydratable: true` option"
        );
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
        dispose = listen_dev(
          a,
          "click",
          prevent_default(/*deleteQuote*/ ctx[3]),
          false,
          true,
          false
        );
      },
      p: function update(ctx, [dirty]) {
        if (
          (!current || dirty & /*quote*/ 1) &&
          t0_value !== (t0_value = /*quote*/ ctx[0].author.name + "")
        )
          set_data_dev(t0, t0_value);
        const longtext_changes = {};
        if (dirty & /*quote, selectedLanguage*/ 3)
          longtext_changes.text = /*quote*/ ctx[0][/*selectedLanguage*/ ctx[1]];
        if (dirty & /*expanded*/ 4)
          longtext_changes.expanded = /*expanded*/ ctx[2];
        longtext.$set(longtext_changes);

        if (/*quote*/ ctx[0].rating !== null) {
          if (if_block) {
            if_block.p(ctx, dirty);
            transition_in(if_block, 1);
          } else {
            if_block = create_if_block$4(ctx);
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

        if (
          !current ||
          (dirty & /*quote*/ 1 &&
            div2_id_value !== (div2_id_value = /*quote*/ ctx[0].id))
        ) {
          attr_dev(div2, "id", div2_id_value);
        }
      },
      i: function intro(local) {
        if (current) return;
        transition_in(longtext.$$.fragment, local);
        transition_in(if_block);

        if (local) {
          add_render_callback(() => {
            if (!div2_transition)
              div2_transition = create_bidirectional_transition(
                div2,
                fade,
                {},
                true
              );
            div2_transition.run(1);
          });
        }

        current = true;
      },
      o: function outro(local) {
        transition_out(longtext.$$.fragment, local);
        transition_out(if_block);

        if (local) {
          if (!div2_transition)
            div2_transition = create_bidirectional_transition(
              div2,
              fade,
              {},
              false
            );
          div2_transition.run(0);
        }

        current = false;
      },
      d: function destroy(detaching) {
        if (detaching) detach_dev(div2);
        destroy_component(longtext);
        if (if_block) if_block.d();
        if (detaching && div2_transition) div2_transition.end();
        dispose();
      },
    };

    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_fragment$b.name,
      type: "component",
      source: "",
      ctx,
    });

    return block;
  }

  function instance$b($$self, $$props, $$invalidate) {
    let { quote } = $$props;
    let { selectedLanguage } = $$props;
    let { expanded } = $$props;
    let { onQuoteDelete } = $$props;

    async function deleteQuote() {
      try {
        await fetch(`http://localhost:3000/api/quotes/${quote.id}`, {
          method: "DELETE",
        });
        onQuoteDelete(quote.id);
      } catch (error) {
        console.log(error);
      }
    }

    const writable_props = [
      "quote",
      "selectedLanguage",
      "expanded",
      "onQuoteDelete",
    ];

    Object.keys($$props).forEach((key) => {
      if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$")
        console_1$1.warn(`<Quote> was created with unknown prop '${key}'`);
    });

    let { $$slots = {}, $$scope } = $$props;
    validate_slots("Quote", $$slots, []);

    $$self.$set = ($$props) => {
      if ("quote" in $$props) $$invalidate(0, (quote = $$props.quote));
      if ("selectedLanguage" in $$props)
        $$invalidate(1, (selectedLanguage = $$props.selectedLanguage));
      if ("expanded" in $$props) $$invalidate(2, (expanded = $$props.expanded));
      if ("onQuoteDelete" in $$props)
        $$invalidate(4, (onQuoteDelete = $$props.onQuoteDelete));
    };

    $$self.$capture_state = () => ({
      fade,
      LongText,
      Rating,
      quote,
      selectedLanguage,
      expanded,
      onQuoteDelete,
      deleteQuote,
    });

    $$self.$inject_state = ($$props) => {
      if ("quote" in $$props) $$invalidate(0, (quote = $$props.quote));
      if ("selectedLanguage" in $$props)
        $$invalidate(1, (selectedLanguage = $$props.selectedLanguage));
      if ("expanded" in $$props) $$invalidate(2, (expanded = $$props.expanded));
      if ("onQuoteDelete" in $$props)
        $$invalidate(4, (onQuoteDelete = $$props.onQuoteDelete));
    };

    if ($$props && "$$inject" in $$props) {
      $$self.$inject_state($$props.$$inject);
    }

    return [quote, selectedLanguage, expanded, deleteQuote, onQuoteDelete];
  }

  class Quote extends SvelteComponentDev {
    constructor(options) {
      super(options);

      init(this, options, instance$b, create_fragment$b, safe_not_equal, {
        quote: 0,
        selectedLanguage: 1,
        expanded: 2,
        onQuoteDelete: 4,
      });

      dispatch_dev("SvelteRegisterComponent", {
        component: this,
        tagName: "Quote",
        options,
        id: create_fragment$b.name,
      });

      const { ctx } = this.$$;
      const props = options.props || {};

      if (/*quote*/ ctx[0] === undefined && !("quote" in props)) {
        console_1$1.warn("<Quote> was created without expected prop 'quote'");
      }

      if (
        /*selectedLanguage*/ ctx[1] === undefined &&
        !("selectedLanguage" in props)
      ) {
        console_1$1.warn(
          "<Quote> was created without expected prop 'selectedLanguage'"
        );
      }

      if (/*expanded*/ ctx[2] === undefined && !("expanded" in props)) {
        console_1$1.warn(
          "<Quote> was created without expected prop 'expanded'"
        );
      }

      if (
        /*onQuoteDelete*/ ctx[4] === undefined &&
        !("onQuoteDelete" in props)
      ) {
        console_1$1.warn(
          "<Quote> was created without expected prop 'onQuoteDelete'"
        );
      }
    }

    get quote() {
      throw new Error(
        "<Quote>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
      );
    }

    set quote(value) {
      throw new Error(
        "<Quote>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
      );
    }

    get selectedLanguage() {
      throw new Error(
        "<Quote>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
      );
    }

    set selectedLanguage(value) {
      throw new Error(
        "<Quote>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
      );
    }

    get expanded() {
      throw new Error(
        "<Quote>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
      );
    }

    set expanded(value) {
      throw new Error(
        "<Quote>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
      );
    }

    get onQuoteDelete() {
      throw new Error(
        "<Quote>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
      );
    }

    set onQuoteDelete(value) {
      throw new Error(
        "<Quote>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
      );
    }
  }

  /* src\client\components\Search.svelte generated by Svelte v3.20.1 */

  const file$a = "src\\client\\components\\Search.svelte";

  function create_fragment$c(ctx) {
    let input;
    let dispose;

    const block = {
      c: function create() {
        input = element("input");
        attr_dev(input, "class", "form-control mr-sm-2");
        attr_dev(input, "type", "text");
        attr_dev(input, "placeholder", "Search");
        add_location(input, file$a, 4, 0, 46);
      },
      l: function claim(nodes) {
        throw new Error(
          "options.hydrate only works if the component was compiled with the `hydratable: true` option"
        );
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
      },
    };

    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_fragment$c.name,
      type: "component",
      source: "",
      ctx,
    });

    return block;
  }

  function instance$c($$self, $$props, $$invalidate) {
    let { search = "" } = $$props;
    const writable_props = ["search"];

    Object.keys($$props).forEach((key) => {
      if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$")
        console.warn(`<Search> was created with unknown prop '${key}'`);
    });

    let { $$slots = {}, $$scope } = $$props;
    validate_slots("Search", $$slots, []);

    function input_input_handler() {
      search = this.value;
      $$invalidate(0, search);
    }

    $$self.$set = ($$props) => {
      if ("search" in $$props) $$invalidate(0, (search = $$props.search));
    };

    $$self.$capture_state = () => ({ search });

    $$self.$inject_state = ($$props) => {
      if ("search" in $$props) $$invalidate(0, (search = $$props.search));
    };

    if ($$props && "$$inject" in $$props) {
      $$self.$inject_state($$props.$$inject);
    }

    return [search, input_input_handler];
  }

  class Search extends SvelteComponentDev {
    constructor(options) {
      super(options);
      init(this, options, instance$c, create_fragment$c, safe_not_equal, {
        search: 0,
      });

      dispatch_dev("SvelteRegisterComponent", {
        component: this,
        tagName: "Search",
        options,
        id: create_fragment$c.name,
      });
    }

    get search() {
      throw new Error(
        "<Search>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
      );
    }

    set search(value) {
      throw new Error(
        "<Search>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'"
      );
    }
  }

  /* src\client\routes\Home.svelte generated by Svelte v3.20.1 */

  const { console: console_1$2 } = globals;
  const file$b = "src\\client\\routes\\Home.svelte";

  function get_each_context$3(ctx, list, i) {
    const child_ctx = ctx.slice();
    child_ctx[21] = list[i];
    return child_ctx;
  }

  function get_each_context_1(ctx, list, i) {
    const child_ctx = ctx.slice();
    child_ctx[24] = list[i];
    return child_ctx;
  }

  // (115:4) {#if showAuthorDropdown}
  function create_if_block$5(ctx) {
    let div;
    let each_value_1 = /*authors*/ ctx[3];
    validate_each_argument(each_value_1);
    let each_blocks = [];

    for (let i = 0; i < each_value_1.length; i += 1) {
      each_blocks[i] = create_each_block_1(
        get_each_context_1(ctx, each_value_1, i)
      );
    }

    const block = {
      c: function create() {
        div = element("div");

        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].c();
        }

        attr_dev(div, "class", "dropdown-menu show p-1");
        add_location(div, file$b, 115, 6, 2712);
      },
      m: function mount(target, anchor) {
        insert_dev(target, div, anchor);

        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].m(div, null);
        }
      },
      p: function update(ctx, dirty) {
        if (dirty & /*authors, selectedAuthors*/ 24) {
          each_value_1 = /*authors*/ ctx[3];
          validate_each_argument(each_value_1);
          let i;

          for (i = 0; i < each_value_1.length; i += 1) {
            const child_ctx = get_each_context_1(ctx, each_value_1, i);

            if (each_blocks[i]) {
              each_blocks[i].p(child_ctx, dirty);
            } else {
              each_blocks[i] = create_each_block_1(child_ctx);
              each_blocks[i].c();
              each_blocks[i].m(div, null);
            }
          }

          for (; i < each_blocks.length; i += 1) {
            each_blocks[i].d(1);
          }

          each_blocks.length = each_value_1.length;
        }
      },
      d: function destroy(detaching) {
        if (detaching) detach_dev(div);
        destroy_each(each_blocks, detaching);
      },
    };

    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_if_block$5.name,
      type: "if",
      source: "(115:4) {#if showAuthorDropdown}",
      ctx,
    });

    return block;
  }

  // (117:8) {#each authors as author}
  function create_each_block_1(ctx) {
    let div;
    let label;
    let input;
    let input_value_value;
    let t0;
    let t1_value = /*author*/ ctx[24] + "";
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
        input.__value = input_value_value = /*author*/ ctx[24];
        input.value = input.__value;
        /*$$binding_groups*/ ctx[18][0].push(input);
        add_location(input, file$b, 119, 14, 2881);
        attr_dev(label, "class", "form-check-label");
        add_location(label, file$b, 118, 12, 2833);
        attr_dev(div, "class", "form-check");
        add_location(div, file$b, 117, 10, 2795);
      },
      m: function mount(target, anchor, remount) {
        insert_dev(target, div, anchor);
        append_dev(div, label);
        append_dev(label, input);
        input.checked = ~(/*selectedAuthors*/ ctx[4].indexOf(input.__value));
        append_dev(label, t0);
        append_dev(label, t1);
        append_dev(div, t2);
        if (remount) dispose();
        dispose = listen_dev(input, "change", /*input_change_handler*/ ctx[17]);
      },
      p: function update(ctx, dirty) {
        if (
          dirty & /*authors*/ 8 &&
          input_value_value !== (input_value_value = /*author*/ ctx[24])
        ) {
          prop_dev(input, "__value", input_value_value);
        }

        input.value = input.__value;

        if (dirty & /*selectedAuthors*/ 16) {
          input.checked = ~(/*selectedAuthors*/ ctx[4].indexOf(input.__value));
        }

        if (
          dirty & /*authors*/ 8 &&
          t1_value !== (t1_value = /*author*/ ctx[24] + "")
        )
          set_data_dev(t1, t1_value);
      },
      d: function destroy(detaching) {
        if (detaching) detach_dev(div);
        /*$$binding_groups*/ ctx[18][0].splice(
          /*$$binding_groups*/ ctx[18][0].indexOf(input),
          1
        );
        dispose();
      },
    };

    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_each_block_1.name,
      type: "each",
      source: "(117:8) {#each authors as author}",
      ctx,
    });

    return block;
  }

  // (143:2) {#each quotesFiltered as quote (quote.id)}
  function create_each_block$3(key_1, ctx) {
    let first;
    let current;

    const quote = new Quote({
      props: {
        quote: /*quote*/ ctx[21],
        selectedLanguage: /*selectedLanguage*/ ctx[1],
        expanded: /*expanded*/ ctx[2],
        onQuoteDelete: /*onQuoteDelete*/ ctx[8],
      },
      $$inline: true,
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
        if (dirty & /*quotesFiltered*/ 1)
          quote_changes.quote = /*quote*/ ctx[21];
        if (dirty & /*selectedLanguage*/ 2)
          quote_changes.selectedLanguage = /*selectedLanguage*/ ctx[1];
        if (dirty & /*expanded*/ 4)
          quote_changes.expanded = /*expanded*/ ctx[2];
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
      },
    };

    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_each_block$3.name,
      type: "each",
      source: "(143:2) {#each quotesFiltered as quote (quote.id)}",
      ctx,
    });

    return block;
  }

  function create_fragment$d(ctx) {
    let div1;
    let form;
    let updating_search;
    let t0;
    let div0;
    let button;
    let t2;
    let t3;
    let updating_expanded;
    let t4;
    let updating_selectedLanguage;
    let t5;
    let div2;
    let each_blocks = [];
    let each_1_lookup = new Map();
    let current;
    let dispose;

    function search_1_search_binding(value) {
      /*search_1_search_binding*/ ctx[16].call(null, value);
    }

    let search_1_props = {};

    if (/*search*/ ctx[5] !== void 0) {
      search_1_props.search = /*search*/ ctx[5];
    }

    const search_1 = new Search({ props: search_1_props, $$inline: true });
    binding_callbacks.push(() =>
      bind(search_1, "search", search_1_search_binding)
    );
    let if_block = /*showAuthorDropdown*/ ctx[6] && create_if_block$5(ctx);

    function expandallmenu_expanded_binding(value) {
      /*expandallmenu_expanded_binding*/ ctx[19].call(null, value);
    }

    let expandallmenu_props = {};

    if (/*expanded*/ ctx[2] !== void 0) {
      expandallmenu_props.expanded = /*expanded*/ ctx[2];
    }

    const expandallmenu = new ExpandAllMenu({
      props: expandallmenu_props,
      $$inline: true,
    });

    binding_callbacks.push(() =>
      bind(expandallmenu, "expanded", expandallmenu_expanded_binding)
    );

    function languagedropdown_selectedLanguage_binding(value) {
      /*languagedropdown_selectedLanguage_binding*/ ctx[20].call(null, value);
    }

    let languagedropdown_props = { languages: /*languages*/ ctx[7] };

    if (/*selectedLanguage*/ ctx[1] !== void 0) {
      languagedropdown_props.selectedLanguage = /*selectedLanguage*/ ctx[1];
    }

    const languagedropdown = new LanguageDropdown({
      props: languagedropdown_props,
      $$inline: true,
    });

    binding_callbacks.push(() =>
      bind(
        languagedropdown,
        "selectedLanguage",
        languagedropdown_selectedLanguage_binding
      )
    );
    let each_value = /*quotesFiltered*/ ctx[0];
    validate_each_argument(each_value);
    const get_key = (ctx) => /*quote*/ ctx[21].id;
    validate_each_keys(ctx, each_value, get_each_context$3, get_key);

    for (let i = 0; i < each_value.length; i += 1) {
      let child_ctx = get_each_context$3(ctx, each_value, i);
      let key = get_key(child_ctx);
      each_1_lookup.set(
        key,
        (each_blocks[i] = create_each_block$3(key, child_ctx))
      );
    }

    const block = {
      c: function create() {
        div1 = element("div");
        form = element("form");
        create_component(search_1.$$.fragment);
        t0 = space();
        div0 = element("div");
        button = element("button");
        button.textContent = "Authors";
        t2 = space();
        if (if_block) if_block.c();
        t3 = space();
        create_component(expandallmenu.$$.fragment);
        t4 = space();
        create_component(languagedropdown.$$.fragment);
        t5 = space();
        div2 = element("div");

        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].c();
        }

        attr_dev(form, "class", "form-inline");
        add_location(form, file$b, 101, 2, 2373);
        attr_dev(button, "type", "button");
        attr_dev(
          button,
          "class",
          "btn btn-outline-secondary dropdown-toggle white-background svelte-1e278co"
        );
        add_location(button, file$b, 107, 4, 2500);
        attr_dev(div0, "class", "dropdown");
        add_location(div0, file$b, 106, 2, 2472);
        attr_dev(
          div1,
          "class",
          "filter-bar d-flex justify-content-between p-2 svelte-1e278co"
        );
        add_location(div1, file$b, 98, 0, 2285);
        attr_dev(div2, "class", "quotes");
        add_location(div2, file$b, 141, 0, 3335);
      },
      l: function claim(nodes) {
        throw new Error(
          "options.hydrate only works if the component was compiled with the `hydratable: true` option"
        );
      },
      m: function mount(target, anchor, remount) {
        insert_dev(target, div1, anchor);
        append_dev(div1, form);
        mount_component(search_1, form, null);
        append_dev(div1, t0);
        append_dev(div1, div0);
        append_dev(div0, button);
        append_dev(div0, t2);
        if (if_block) if_block.m(div0, null);
        append_dev(div1, t3);
        mount_component(expandallmenu, div1, null);
        append_dev(div1, t4);
        mount_component(languagedropdown, div1, null);
        insert_dev(target, t5, anchor);
        insert_dev(target, div2, anchor);

        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].m(div2, null);
        }

        current = true;
        if (remount) dispose();
        dispose = listen_dev(
          button,
          "click",
          /*toggleAuthorDropdown*/ ctx[9],
          false,
          false,
          false
        );
      },
      p: function update(ctx, [dirty]) {
        const search_1_changes = {};

        if (!updating_search && dirty & /*search*/ 32) {
          updating_search = true;
          search_1_changes.search = /*search*/ ctx[5];
          add_flush_callback(() => (updating_search = false));
        }

        search_1.$set(search_1_changes);

        if (/*showAuthorDropdown*/ ctx[6]) {
          if (if_block) {
            if_block.p(ctx, dirty);
          } else {
            if_block = create_if_block$5(ctx);
            if_block.c();
            if_block.m(div0, null);
          }
        } else if (if_block) {
          if_block.d(1);
          if_block = null;
        }

        const expandallmenu_changes = {};

        if (!updating_expanded && dirty & /*expanded*/ 4) {
          updating_expanded = true;
          expandallmenu_changes.expanded = /*expanded*/ ctx[2];
          add_flush_callback(() => (updating_expanded = false));
        }

        expandallmenu.$set(expandallmenu_changes);
        const languagedropdown_changes = {};

        if (!updating_selectedLanguage && dirty & /*selectedLanguage*/ 2) {
          updating_selectedLanguage = true;
          languagedropdown_changes.selectedLanguage =
            /*selectedLanguage*/ ctx[1];
          add_flush_callback(() => (updating_selectedLanguage = false));
        }

        languagedropdown.$set(languagedropdown_changes);

        if (
          dirty &
          /*quotesFiltered, selectedLanguage, expanded, onQuoteDelete*/ 263
        ) {
          const each_value = /*quotesFiltered*/ ctx[0];
          validate_each_argument(each_value);
          group_outros();
          validate_each_keys(ctx, each_value, get_each_context$3, get_key);
          each_blocks = update_keyed_each(
            each_blocks,
            dirty,
            get_key,
            1,
            ctx,
            each_value,
            each_1_lookup,
            div2,
            outro_and_destroy_block,
            create_each_block$3,
            null,
            get_each_context$3
          );
          check_outros();
        }
      },
      i: function intro(local) {
        if (current) return;
        transition_in(search_1.$$.fragment, local);
        transition_in(expandallmenu.$$.fragment, local);
        transition_in(languagedropdown.$$.fragment, local);

        for (let i = 0; i < each_value.length; i += 1) {
          transition_in(each_blocks[i]);
        }

        current = true;
      },
      o: function outro(local) {
        transition_out(search_1.$$.fragment, local);
        transition_out(expandallmenu.$$.fragment, local);
        transition_out(languagedropdown.$$.fragment, local);

        for (let i = 0; i < each_blocks.length; i += 1) {
          transition_out(each_blocks[i]);
        }

        current = false;
      },
      d: function destroy(detaching) {
        if (detaching) detach_dev(div1);
        destroy_component(search_1);
        if (if_block) if_block.d();
        destroy_component(expandallmenu);
        destroy_component(languagedropdown);
        if (detaching) detach_dev(t5);
        if (detaching) detach_dev(div2);

        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].d();
        }

        dispose();
      },
    };

    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_fragment$d.name,
      type: "component",
      source: "",
      ctx,
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

  function instance$d($$self, $$props, $$invalidate) {
    const languages = [
      { code: "en", label: "English" },
      { code: "gib", label: "Gibberish" },
    ];
    let quotes = [];
    let quotesFiltered = [];
    let selectedLanguage = "en";
    let expanded = false;
    let authors = [];
    let selectedAuthors = [];
    let search;
    let showAuthorDropdown = false;
    getQuotes();

    async function getQuotes() {
      try {
        const res = await fetch(url);
        $$invalidate(10, (quotes = await res.json()));
        $$invalidate(3, (authors = getAuthors(quotes)));
      } catch (error) {
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
        return (
          quote.author.name.toLowerCase().includes(searchInput) ||
          quote[selectedLanguage].toLowerCase().includes(searchInput)
        );
      }

      return true;
    }

    function quoteMeetsFilters(quote) {
      return searchFilter(quote) && authorFilter(quote);
    }

    function setQuotesFiltered() {
      $$invalidate(0, (quotesFiltered = quotes.filter(quoteMeetsFilters)));
    }

    async function onQuoteDelete(id) {
      alert("Quote deleted!");
      await getQuotes();
    }

    function toggleAuthorDropdown() {
      $$invalidate(6, (showAuthorDropdown = !showAuthorDropdown));
    }

    const writable_props = [];

    Object.keys($$props).forEach((key) => {
      if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$")
        console_1$2.warn(`<Home> was created with unknown prop '${key}'`);
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

    function expandallmenu_expanded_binding(value) {
      expanded = value;
      $$invalidate(2, expanded);
    }

    function languagedropdown_selectedLanguage_binding(value) {
      selectedLanguage = value;
      $$invalidate(1, selectedLanguage);
    }

    $$self.$capture_state = () => ({
      ExpandAllMenu,
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
      showAuthorDropdown,
      getQuotes,
      getAuthors,
      authorFilter,
      searchFilter,
      quoteMeetsFilters,
      setQuotesFiltered,
      onQuoteDelete,
      toggleAuthorDropdown,
    });

    $$self.$inject_state = ($$props) => {
      if ("quotes" in $$props) $$invalidate(10, (quotes = $$props.quotes));
      if ("quotesFiltered" in $$props)
        $$invalidate(0, (quotesFiltered = $$props.quotesFiltered));
      if ("selectedLanguage" in $$props)
        $$invalidate(1, (selectedLanguage = $$props.selectedLanguage));
      if ("expanded" in $$props) $$invalidate(2, (expanded = $$props.expanded));
      if ("authors" in $$props) $$invalidate(3, (authors = $$props.authors));
      if ("selectedAuthors" in $$props)
        $$invalidate(4, (selectedAuthors = $$props.selectedAuthors));
      if ("search" in $$props) $$invalidate(5, (search = $$props.search));
      if ("showAuthorDropdown" in $$props)
        $$invalidate(6, (showAuthorDropdown = $$props.showAuthorDropdown));
    };

    if ($$props && "$$inject" in $$props) {
      $$self.$inject_state($$props.$$inject);
    }

    $$self.$$.update = () => {
      if (
        $$self.$$.dirty &
        /*quotes, search, selectedAuthors, selectedLanguage*/ 1074
      ) {
        setQuotesFiltered();
      }
    };

    return [
      quotesFiltered,
      selectedLanguage,
      expanded,
      authors,
      selectedAuthors,
      search,
      showAuthorDropdown,
      languages,
      onQuoteDelete,
      toggleAuthorDropdown,
      quotes,
      getQuotes,
      authorFilter,
      searchFilter,
      quoteMeetsFilters,
      setQuotesFiltered,
      search_1_search_binding,
      input_change_handler,
      $$binding_groups,
      expandallmenu_expanded_binding,
      languagedropdown_selectedLanguage_binding,
    ];
  }

  class Home extends SvelteComponentDev {
    constructor(options) {
      super(options);
      init(this, options, instance$d, create_fragment$d, safe_not_equal, {});

      dispatch_dev("SvelteRegisterComponent", {
        component: this,
        tagName: "Home",
        options,
        id: create_fragment$d.name,
      });
    }
  }

  /* src\client\components\NavBar.svelte generated by Svelte v3.20.1 */

  const file$c = "src\\client\\components\\NavBar.svelte";

  function create_fragment$e(ctx) {
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
        a2.textContent = "Generate Quote";
        t5 = space();
        a3 = element("a");
        a3.textContent = "Explore Authors";
        t7 = space();
        a4 = element("a");
        a4.textContent = "Link 5";
        attr_dev(a0, "href", "/");
        attr_dev(a0, "class", "p-2 text-muted");
        add_location(a0, file$c, 11, 2, 151);
        attr_dev(a1, "href", "/add");
        attr_dev(a1, "class", "p-2 text-muted");
        add_location(a1, file$c, 12, 2, 203);
        attr_dev(a2, "href", "/generate");
        attr_dev(a2, "class", "p-2 text-muted");
        add_location(a2, file$c, 13, 2, 258);
        attr_dev(a3, "href", "/authors");
        attr_dev(a3, "class", "p-2 text-muted");
        add_location(a3, file$c, 14, 2, 323);
        attr_dev(a4, "href", "/");
        attr_dev(a4, "class", "p-2 text-muted");
        add_location(a4, file$c, 15, 2, 388);
        attr_dev(
          nav,
          "class",
          "nav d-flex justify-content-between svelte-1p0iwbe"
        );
        add_location(nav, file$c, 10, 0, 99);
      },
      l: function claim(nodes) {
        throw new Error(
          "options.hydrate only works if the component was compiled with the `hydratable: true` option"
        );
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
      },
    };

    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_fragment$e.name,
      type: "component",
      source: "",
      ctx,
    });

    return block;
  }

  function instance$e($$self, $$props) {
    const writable_props = [];

    Object.keys($$props).forEach((key) => {
      if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$")
        console.warn(`<NavBar> was created with unknown prop '${key}'`);
    });

    let { $$slots = {}, $$scope } = $$props;
    validate_slots("NavBar", $$slots, []);
    return [];
  }

  class NavBar extends SvelteComponentDev {
    constructor(options) {
      super(options);
      init(this, options, instance$e, create_fragment$e, safe_not_equal, {});

      dispatch_dev("SvelteRegisterComponent", {
        component: this,
        tagName: "NavBar",
        options,
        id: create_fragment$e.name,
      });
    }
  }

  /* src\client\components\PageHeader.svelte generated by Svelte v3.20.1 */

  const file$d = "src\\client\\components\\PageHeader.svelte";

  function create_fragment$f(ctx) {
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
        add_location(a0, file$d, 19, 12, 387);
        attr_dev(div0, "class", "col-4");
        add_location(div0, file$d, 18, 8, 354);
        attr_dev(a1, "href", "/");
        attr_dev(a1, "class", "text-dark");
        add_location(a1, file$d, 22, 12, 541);
        attr_dev(
          div1,
          "class",
          "col-4 text-center page-header-title svelte-1lp3vqv"
        );
        attr_dev(div1, "id", "page-title");
        add_location(div1, file$d, 21, 8, 462);
        attr_dev(a2, "href", "/");
        attr_dev(a2, "class", "text-muted");
        add_location(a2, file$d, 25, 12, 651);
        attr_dev(div2, "class", "col-4 text-right");
        add_location(div2, file$d, 24, 8, 607);
        attr_dev(div3, "class", "row d-flex align-items-center header-content");
        add_location(div3, file$d, 17, 4, 286);
        attr_dev(header, "class", "page-header svelte-1lp3vqv");
        add_location(header, file$d, 16, 0, 252);
      },
      l: function claim(nodes) {
        throw new Error(
          "options.hydrate only works if the component was compiled with the `hydratable: true` option"
        );
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
      },
    };

    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_fragment$f.name,
      type: "component",
      source: "",
      ctx,
    });

    return block;
  }

  function instance$f($$self, $$props) {
    const writable_props = [];

    Object.keys($$props).forEach((key) => {
      if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$")
        console.warn(`<PageHeader> was created with unknown prop '${key}'`);
    });

    let { $$slots = {}, $$scope } = $$props;
    validate_slots("PageHeader", $$slots, []);
    return [];
  }

  class PageHeader extends SvelteComponentDev {
    constructor(options) {
      super(options);
      init(this, options, instance$f, create_fragment$f, safe_not_equal, {});

      dispatch_dev("SvelteRegisterComponent", {
        component: this,
        tagName: "PageHeader",
        options,
        id: create_fragment$f.name,
      });
    }
  }

  /* src\client\App.svelte generated by Svelte v3.20.1 */
  const file$e = "src\\client\\App.svelte";

  // (47:6) <Route path="/">
  function create_default_slot_4(ctx) {
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
      },
    };

    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_default_slot_4.name,
      type: "slot",
      source: '(47:6) <Route path=\\"/\\">',
      ctx,
    });

    return block;
  }

  // (51:6) <Route path="add">
  function create_default_slot_3(ctx) {
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
      },
    };

    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_default_slot_3.name,
      type: "slot",
      source: '(51:6) <Route path=\\"add\\">',
      ctx,
    });

    return block;
  }

  // (55:6) <Route path="generate">
  function create_default_slot_2(ctx) {
    let current;
    const generatequote = new GenerateQuote({ $$inline: true });

    const block = {
      c: function create() {
        create_component(generatequote.$$.fragment);
      },
      m: function mount(target, anchor) {
        mount_component(generatequote, target, anchor);
        current = true;
      },
      i: function intro(local) {
        if (current) return;
        transition_in(generatequote.$$.fragment, local);
        current = true;
      },
      o: function outro(local) {
        transition_out(generatequote.$$.fragment, local);
        current = false;
      },
      d: function destroy(detaching) {
        destroy_component(generatequote, detaching);
      },
    };

    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_default_slot_2.name,
      type: "slot",
      source: '(55:6) <Route path=\\"generate\\">',
      ctx,
    });

    return block;
  }

  // (59:6) <Route path="authors">
  function create_default_slot_1(ctx) {
    let current;
    const authors = new Authors({ $$inline: true });

    const block = {
      c: function create() {
        create_component(authors.$$.fragment);
      },
      m: function mount(target, anchor) {
        mount_component(authors, target, anchor);
        current = true;
      },
      i: function intro(local) {
        if (current) return;
        transition_in(authors.$$.fragment, local);
        current = true;
      },
      o: function outro(local) {
        transition_out(authors.$$.fragment, local);
        current = false;
      },
      d: function destroy(detaching) {
        destroy_component(authors, detaching);
      },
    };

    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_default_slot_1.name,
      type: "slot",
      source: '(59:6) <Route path=\\"authors\\">',
      ctx,
    });

    return block;
  }

  // (40:2) <Router>
  function create_default_slot(ctx) {
    let div;
    let t0;
    let t1;
    let t2;
    let t3;
    let t4;
    let current;
    const pageheader = new PageHeader({ $$inline: true });
    const navbar = new NavBar({ $$inline: true });

    const route0 = new Route({
      props: {
        path: "/",
        $$slots: { default: [create_default_slot_4] },
        $$scope: { ctx },
      },
      $$inline: true,
    });

    const route1 = new Route({
      props: {
        path: "add",
        $$slots: { default: [create_default_slot_3] },
        $$scope: { ctx },
      },
      $$inline: true,
    });

    const route2 = new Route({
      props: {
        path: "generate",
        $$slots: { default: [create_default_slot_2] },
        $$scope: { ctx },
      },
      $$inline: true,
    });

    const route3 = new Route({
      props: {
        path: "authors",
        $$slots: { default: [create_default_slot_1] },
        $$scope: { ctx },
      },
      $$inline: true,
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
        t3 = space();
        create_component(route2.$$.fragment);
        t4 = space();
        create_component(route3.$$.fragment);
        attr_dev(div, "class", "container");
        add_location(div, file$e, 40, 4, 1032);
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
        append_dev(div, t3);
        mount_component(route2, div, null);
        append_dev(div, t4);
        mount_component(route3, div, null);
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
        const route2_changes = {};

        if (dirty & /*$$scope*/ 1) {
          route2_changes.$$scope = { dirty, ctx };
        }

        route2.$set(route2_changes);
        const route3_changes = {};

        if (dirty & /*$$scope*/ 1) {
          route3_changes.$$scope = { dirty, ctx };
        }

        route3.$set(route3_changes);
      },
      i: function intro(local) {
        if (current) return;
        transition_in(pageheader.$$.fragment, local);
        transition_in(navbar.$$.fragment, local);
        transition_in(route0.$$.fragment, local);
        transition_in(route1.$$.fragment, local);
        transition_in(route2.$$.fragment, local);
        transition_in(route3.$$.fragment, local);
        current = true;
      },
      o: function outro(local) {
        transition_out(pageheader.$$.fragment, local);
        transition_out(navbar.$$.fragment, local);
        transition_out(route0.$$.fragment, local);
        transition_out(route1.$$.fragment, local);
        transition_out(route2.$$.fragment, local);
        transition_out(route3.$$.fragment, local);
        current = false;
      },
      d: function destroy(detaching) {
        if (detaching) detach_dev(div);
        destroy_component(pageheader);
        destroy_component(navbar);
        destroy_component(route0);
        destroy_component(route1);
        destroy_component(route2);
        destroy_component(route3);
      },
    };

    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_default_slot.name,
      type: "slot",
      source: "(40:2) <Router>",
      ctx,
    });

    return block;
  }

  function create_fragment$g(ctx) {
    let link0;
    let link1;
    let t;
    let div;
    let links_action;
    let current;
    let dispose;

    const router = new Router({
      props: {
        $$slots: { default: [create_default_slot] },
        $$scope: { ctx },
      },
      $$inline: true,
    });

    const block = {
      c: function create() {
        link0 = element("link");
        link1 = element("link");
        t = space();
        div = element("div");
        create_component(router.$$.fragment);
        attr_dev(link0, "rel", "stylesheet");
        attr_dev(
          link0,
          "href",
          "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
        );
        add_location(link0, file$e, 23, 2, 580);
        attr_dev(link1, "rel", "stylesheet");
        attr_dev(
          link1,
          "href",
          "https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css"
        );
        attr_dev(
          link1,
          "integrity",
          "sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh"
        );
        attr_dev(link1, "crossorigin", "anonymous");
        add_location(link1, file$e, 28, 2, 729);
        document.title = "Quotes";
        add_location(div, file$e, 38, 0, 1001);
      },
      l: function claim(nodes) {
        throw new Error(
          "options.hydrate only works if the component was compiled with the `hydratable: true` option"
        );
      },
      m: function mount(target, anchor, remount) {
        append_dev(document.head, link0);
        append_dev(document.head, link1);
        insert_dev(target, t, anchor);
        insert_dev(target, div, anchor);
        mount_component(router, div, null);
        current = true;
        if (remount) dispose();
        dispose = action_destroyer((links_action = links.call(null, div)));
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
        if (detaching) detach_dev(t);
        if (detaching) detach_dev(div);
        destroy_component(router);
        dispose();
      },
    };

    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_fragment$g.name,
      type: "component",
      source: "",
      ctx,
    });

    return block;
  }

  function instance$g($$self, $$props, $$invalidate) {
    const writable_props = [];

    Object.keys($$props).forEach((key) => {
      if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$")
        console.warn(`<App> was created with unknown prop '${key}'`);
    });

    let { $$slots = {}, $$scope } = $$props;
    validate_slots("App", $$slots, []);

    $$self.$capture_state = () => ({
      Router,
      Link,
      Route,
      links,
      AddQuote,
      Authors,
      GenerateQuote,
      Home,
      NavBar,
      PageHeader,
    });

    return [];
  }

  class App extends SvelteComponentDev {
    constructor(options) {
      super(options);
      init(this, options, instance$g, create_fragment$g, safe_not_equal, {});

      dispatch_dev("SvelteRegisterComponent", {
        component: this,
        tagName: "App",
        options,
        id: create_fragment$g.name,
      });
    }
  }

  const app = new App({
    target: document.body,
  });

  return app;
})();
//# sourceMappingURL=bundle.js.map
