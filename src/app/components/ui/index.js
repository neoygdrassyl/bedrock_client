/**
 * Dovela UI — Drop-in replacements for mdb-react-ui-kit
 *
 * These components replicate the MDB API surface using native HTML + Bootstrap 5
 * classes for simple components, and react-bootstrap for behavioral components
 * (Tooltip, Popover, Dropdown, Collapse, Modal).
 *
 * Created to eliminate the abandoned mdb-react-ui-kit@1.0.0-beta3 dependency
 * whose `defaultProps` pattern is incompatible with React 19.
 *
 * Each component accepts the same props the codebase already passes.
 * Over time, usage can be refactored to plain Bootstrap or react-bootstrap
 * directly, and these wrappers can be removed.
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

// ─── Utility ──────────────────────────────────────────────────────────────────

const clsx = (...args) => args.filter(Boolean).join(' ');

// ─── Layout ───────────────────────────────────────────────────────────────────

export const MDBContainer = ({ tag: Tag = 'div', fluid, className, children, ...rest }) => (
  <Tag className={clsx(fluid ? 'container-fluid' : 'container', className)} {...rest}>{children}</Tag>
);

export const MDBRow = ({ tag: Tag = 'div', className, children, ...rest }) => (
  <Tag className={clsx('row', className)} {...rest}>{children}</Tag>
);

export const MDBCol = ({ tag: Tag = 'div', className, children, size, sm, md, lg, xl, xxl, ...rest }) => {
  const cols = [];
  if (size) cols.push(`col-${size}`);
  if (sm) cols.push(`col-sm-${sm}`);
  if (md) cols.push(`col-md-${md}`);
  if (lg) cols.push(`col-lg-${lg}`);
  if (xl) cols.push(`col-xl-${xl}`);
  if (xxl) cols.push(`col-xxl-${xxl}`);
  if (cols.length === 0) cols.push('col');
  return <Tag className={clsx(...cols, className)} {...rest}>{children}</Tag>;
};

// ─── Button ───────────────────────────────────────────────────────────────────

export const MDBBtn = ({
  tag, color = 'primary', outline, size, rounded, floating, block, active,
  disabled, noRipple, toggle, className, children, href, role = 'button', ref, ...rest
}) => {
  let Tag = tag || (href ? 'a' : 'button');
  if (href && Tag === 'button') Tag = 'a';

  const btnClass = color !== 'none'
    ? (outline
        ? `btn-outline-${color || 'primary'}`
        : `btn-${color || 'primary'}`)
    : '';

  const cls = clsx(
    color !== 'none' && 'btn',
    btnClass,
    rounded && 'btn-rounded',
    floating && 'btn-floating',
    size && `btn-${size}`,
    block && 'btn-block',
    active && 'active',
    (href || Tag !== 'button') && disabled && 'disabled',
    className,
  );

  const props = { className: cls, ref, disabled: Tag === 'button' ? disabled : undefined, ...rest };
  if (href) props.href = href;
  if (Tag === 'button') props.type = rest.type || 'button';
  if (role) props.role = role;
  return <Tag {...props}>{children}</Tag>;
};

export const MDBBtnGroup = ({ tag: Tag = 'div', className, children, role = 'group', size, ...rest }) => (
  <Tag className={clsx('btn-group', size && `btn-group-${size}`, className)} role={role} {...rest}>{children}</Tag>
);

// ─── Card ─────────────────────────────────────────────────────────────────────

export const MDBCard = ({ tag: Tag = 'div', className, children, ref, ...rest }) => (
  <Tag ref={ref} className={clsx('card', className)} {...rest}>{children}</Tag>
);

export const MDBCardBody = ({ tag: Tag = 'div', className, children, ...rest }) => (
  <Tag className={clsx('card-body', className)} {...rest}>{children}</Tag>
);

export const MDBCardTitle = ({ tag: Tag = 'h5', className, children, ...rest }) => (
  <Tag className={clsx('card-title', className)} {...rest}>{children}</Tag>
);

export const MDBCardText = ({ tag: Tag = 'p', className, children, ...rest }) => (
  <Tag className={clsx('card-text', className)} {...rest}>{children}</Tag>
);

export const MDBCardHeader = ({ tag: Tag = 'div', className, children, ...rest }) => (
  <Tag className={clsx('card-header', className)} {...rest}>{children}</Tag>
);

export const MDBCardFooter = ({ tag: Tag = 'div', className, children, ...rest }) => (
  <Tag className={clsx('card-footer', className)} {...rest}>{children}</Tag>
);

export const MDBCardGroup = ({ tag: Tag = 'div', className, children, ...rest }) => (
  <Tag className={clsx('card-group', className)} {...rest}>{children}</Tag>
);

export const MDBCardImage = ({ tag: Tag = 'img', className, overlay, position, ...rest }) => (
  <Tag className={clsx(overlay ? 'card-img' : position ? `card-img-${position}` : 'card-img-top', className)} {...rest} />
);

export const MDBCardOverlay = ({ tag: Tag = 'div', className, children, ...rest }) => (
  <Tag className={clsx('card-img-overlay', className)} {...rest}>{children}</Tag>
);

export const MDBCardLink = ({ tag: Tag = 'a', className, children, ...rest }) => (
  <Tag className={clsx('card-link', className)} {...rest}>{children}</Tag>
);

export const MDBCardSubTitle = ({ tag: Tag = 'p', className, children, ...rest }) => (
  <Tag className={clsx('card-subtitle', className)} {...rest}>{children}</Tag>
);

// ─── Breadcrumb ───────────────────────────────────────────────────────────────

export const MDBBreadcrumb = ({ tag: Tag = 'ol', className, children, ...rest }) => (
  <nav aria-label="breadcrumb">
    <Tag className={clsx('breadcrumb', className)} {...rest}>{children}</Tag>
  </nav>
);

export const MDBBreadcrumbItem = ({ tag: Tag = 'li', className, active, current = 'page', children, ...rest }) => (
  <Tag
    className={clsx('breadcrumb-item', active && 'active', className)}
    {...(active ? { 'aria-current': current } : {})}
    {...rest}
  >{children}</Tag>
);

// ─── Badge ────────────────────────────────────────────────────────────────────

export const MDBBadge = ({ tag: Tag = 'span', color, pill, dot, notification, className, children, ...rest }) => (
  <Tag className={clsx(
    'badge',
    color && `bg-${color}`,
    pill && 'rounded-pill',
    dot && 'badge-dot',
    notification && 'badge-notification',
    className,
  )} {...rest}>{children}</Tag>
);

// ─── Typography ───────────────────────────────────────────────────────────────

export const MDBTypography = ({ tag: Tag = 'p', variant, note, noteColor, className, children, listUnStyled, listInLine, blockquote, ...rest }) => (
  <Tag className={clsx(
    blockquote && 'blockquote',
    note && 'note',
    noteColor && `note-${noteColor}`,
    listUnStyled && 'list-unstyled',
    listInLine && 'list-inline',
    variant,
    className,
  )} {...rest}>{children}</Tag>
);

// ─── Spinner ──────────────────────────────────────────────────────────────────

export const MDBSpinner = ({ tag: Tag = 'div', color, grow, size, className, ...rest }) => (
  <Tag className={clsx(grow ? 'spinner-grow' : 'spinner-border', color && `text-${color}`, size && `spinner-border-${size}`, className)} role="status" {...rest}>
    <span className="visually-hidden">Loading...</span>
  </Tag>
);

// ─── Table ────────────────────────────────────────────────────────────────────

export const MDBTable = ({ tag: Tag = 'table', className, striped, hover, bordered, borderless, small, responsive, children, align, ...rest }) => {
  const table = (
    <Tag className={clsx(
      'table',
      striped && 'table-striped',
      hover && 'table-hover',
      bordered && 'table-bordered',
      borderless && 'table-borderless',
      small && 'table-sm',
      align && `align-${align}`,
      className,
    )} {...rest}>{children}</Tag>
  );
  return responsive ? <div className="table-responsive">{table}</div> : table;
};

export const MDBTableHead = ({ tag: Tag = 'thead', className, children, ...rest }) => (
  <Tag className={className} {...rest}>{children}</Tag>
);

export const MDBTableBody = ({ tag: Tag = 'tbody', className, children, ...rest }) => (
  <Tag className={className} {...rest}>{children}</Tag>
);

// ─── Pagination ───────────────────────────────────────────────────────────────

export const MDBPagination = ({ tag: Tag = 'ul', className, children, size, circle, ...rest }) => (
  <Tag className={clsx('pagination', size && `pagination-${size}`, circle && 'pagination-circle', className)} {...rest}>{children}</Tag>
);

export const MDBPaginationItem = ({ tag: Tag = 'li', className, active, disabled, children, ...rest }) => (
  <Tag className={clsx('page-item', active && 'active', disabled && 'disabled', className)} {...rest}>{children}</Tag>
);

export const MDBPaginationLink = ({ tag: Tag = 'a', className, children, ...rest }) => (
  <Tag className={clsx('page-link', className)} {...rest}>{children}</Tag>
);

// ─── Progress ─────────────────────────────────────────────────────────────────

export const MDBProgress = ({ tag: Tag = 'div', className, children, height, ...rest }) => (
  <Tag className={clsx('progress', className)} style={height ? { height } : undefined} {...rest}>{children}</Tag>
);

export const MDBProgressBar = ({ tag: Tag = 'div', className, width, valuemin = 0, valuemax = 100, valuenow, bgColor, striped, animated, children, ...rest }) => (
  <Tag
    className={clsx('progress-bar', bgColor && `bg-${bgColor}`, striped && 'progress-bar-striped', animated && 'progress-bar-animated', className)}
    role="progressbar"
    style={{ width: `${width || valuenow || 0}%` }}
    aria-valuenow={valuenow || width}
    aria-valuemin={valuemin}
    aria-valuemax={valuemax}
    {...rest}
  >{children}</Tag>
);

// ─── Input / Form ─────────────────────────────────────────────────────────────

export const MDBInput = ({ wrapperTag: WrapperTag = 'div', wrapperClass, label, id, className, size, readonly, btnType, ...rest }) => (
  <WrapperTag className={clsx(wrapperClass || 'mb-3', className)} style={{ position: 'relative' }}>
    <input
      id={id}
      className={clsx('form-control', size && `form-control-${size}`)}
      readOnly={readonly}
      {...rest}
    />
    {label && <label htmlFor={id} className="form-label">{label}</label>}
  </WrapperTag>
);

export const MDBCheckbox = ({ tag, wrapperTag: WrapperTag = 'div', wrapperClass, label, id, className, ...rest }) => (
  <WrapperTag className={clsx('form-check', wrapperClass)}>
    <input type="checkbox" id={id} className={clsx('form-check-input', className)} {...rest} />
    {label && <label htmlFor={id} className="form-check-label">{label}</label>}
  </WrapperTag>
);

export const MDBRadio = ({ wrapperTag: WrapperTag = 'div', wrapperClass, label, id, className, ...rest }) => (
  <WrapperTag className={clsx('form-check', wrapperClass)}>
    <input type="radio" id={id} className={clsx('form-check-input', className)} {...rest} />
    {label && <label htmlFor={id} className="form-check-label">{label}</label>}
  </WrapperTag>
);

export const MDBSwitch = ({ wrapperTag: WrapperTag = 'div', label, id, className, ...rest }) => (
  <WrapperTag className="form-check form-switch">
    <input type="checkbox" role="switch" id={id} className={clsx('form-check-input', className)} {...rest} />
    {label && <label htmlFor={id} className="form-check-label">{label}</label>}
  </WrapperTag>
);

export const MDBRange = ({ tag, label, id, className, min = '0', max = '100', ...rest }) => (
  <div>
    {label && <label htmlFor={id} className="form-label">{label}</label>}
    <input type="range" id={id} className={clsx('form-range', className)} min={min} max={max} {...rest} />
  </div>
);

export const MDBFile = ({ label, id, className, ...rest }) => (
  <div>
    {label && <label htmlFor={id} className="form-label">{label}</label>}
    <input type="file" id={id} className={clsx('form-control', className)} {...rest} />
  </div>
);

export const MDBInputGroup = ({ tag: Tag = 'div', noWrap, className, children, size, ...rest }) => (
  <Tag className={clsx('input-group', size && `input-group-${size}`, noWrap && 'flex-nowrap', className)} {...rest}>{children}</Tag>
);

export const MDBInputGroupText = ({ tag: Tag = 'span', className, children, noBorder, ...rest }) => (
  <Tag className={clsx('input-group-text', noBorder && 'border-0', className)} {...rest}>{children}</Tag>
);

export const MDBInputGroupElement = ({ className, ...rest }) => (
  <input className={clsx('form-control', className)} {...rest} />
);

export const MDBValidation = ({ tag: Tag = 'form', className, children, noValidate, ...rest }) => (
  <Tag className={clsx(className)} noValidate={noValidate} {...rest}>{children}</Tag>
);

// ─── Navbar ───────────────────────────────────────────────────────────────────

export const MDBNavbar = ({ tag: Tag = 'nav', expand, light, dark, bgColor, fixed, sticky, className, children, ...rest }) => (
  <Tag className={clsx(
    'navbar',
    expand && (expand === true ? 'navbar-expand' : `navbar-expand-${expand}`),
    light && 'navbar-light',
    dark && 'navbar-dark',
    bgColor && `bg-${bgColor}`,
    fixed && `fixed-${fixed}`,
    sticky && 'sticky-top',
    className,
  )} {...rest}>{children}</Tag>
);

export const MDBNavbarBrand = ({ tag: Tag = 'a', className, children, ...rest }) => (
  <Tag className={clsx('navbar-brand', className)} {...rest}>{children}</Tag>
);

export const MDBNavbarNav = ({ tag: Tag = 'ul', className, fullWidth, right, children, ...rest }) => (
  <Tag className={clsx('navbar-nav', fullWidth && 'w-100', right && 'ms-auto', className)} {...rest}>{children}</Tag>
);

export const MDBNavbarItem = ({ tag: Tag = 'li', active, className, children, ...rest }) => (
  <Tag className={clsx('nav-item', active && 'active', className)} {...rest}>{children}</Tag>
);

export const MDBNavbarLink = ({ tag: Tag = 'a', active, disabled, className, children, ...rest }) => (
  <Tag className={clsx('nav-link', active && 'active', disabled && 'disabled', className)} {...rest}>{children}</Tag>
);

export const MDBNavbarToggler = ({ tag: Tag = 'button', type = 'button', className, children, ...rest }) => (
  <Tag type={type} className={clsx('navbar-toggler', className)} {...rest}>
    {children || <span className="navbar-toggler-icon" />}
  </Tag>
);

// ─── Footer ───────────────────────────────────────────────────────────────────

export const MDBFooter = ({ tag: Tag = 'footer', color, bgColor, className, children, ...rest }) => (
  <Tag className={clsx(color && `text-${color}`, bgColor && `bg-${bgColor}`, className)} {...rest}>{children}</Tag>
);

// ─── List Group ───────────────────────────────────────────────────────────────

export const MDBListGroup = ({ tag: Tag = 'ul', light, small, horizontal, className, children, ...rest }) => (
  <Tag className={clsx('list-group', horizontal && 'list-group-horizontal', light && 'list-group-light', small && 'list-group-small', className)} {...rest}>{children}</Tag>
);

export const MDBListGroupItem = ({ tag: Tag = 'li', active, disabled, action, color, className, children, noBorders, ...rest }) => (
  <Tag className={clsx(
    'list-group-item',
    active && 'active',
    disabled && 'disabled',
    action && 'list-group-item-action',
    color && `list-group-item-${color}`,
    noBorders && 'border-0',
    className,
  )} {...rest}>{children}</Tag>
);

// ─── Ripple (no-op in Bootstrap, purely visual MDB feature) ──────────────────

export const MDBRipple = ({ rippleTag: Tag = 'div', className, children, ...rest }) => (
  <Tag className={className} {...rest}>{children}</Tag>
);

// ─── Accordion ────────────────────────────────────────────────────────────────

export const MDBAccordion = ({ tag: Tag = 'div', initialActive, flush, className, children, ...rest }) => (
  <Tag className={clsx('accordion', flush && 'accordion-flush', className)} {...rest}>{children}</Tag>
);

export const MDBAccordionItem = ({ tag: Tag = 'div', collapseId, headerTitle, className, children, btnClassName, ...rest }) => {
  const [open, setOpen] = useState(false);
  return (
    <Tag className={clsx('accordion-item', className)} {...rest}>
      <h2 className="accordion-header">
        <button
          type="button"
          className={clsx('accordion-button', !open && 'collapsed', btnClassName)}
          onClick={() => setOpen(!open)}
        >
          {headerTitle}
        </button>
      </h2>
      <div className={clsx('accordion-collapse collapse', open && 'show')}>
        <div className="accordion-body">{children}</div>
      </div>
    </Tag>
  );
};

// ─── Carousel ─────────────────────────────────────────────────────────────────

export const MDBCarousel = ({ tag: Tag = 'div', showIndicators, showControls, fade, interval = 5000, className, children, ...rest }) => {
  const items = React.Children.toArray(children);
  const [active, setActive] = useState(0);
  const count = items.length;

  useEffect(() => {
    if (interval <= 0 || count <= 1) return;
    const id = setInterval(() => setActive(prev => (prev + 1) % count), interval);
    return () => clearInterval(id);
  }, [interval, count]);

  return (
    <Tag className={clsx('carousel slide', fade && 'carousel-fade', className)} {...rest}>
      {showIndicators && (
        <div className="carousel-indicators">
          {items.map((_, i) => (
            <button key={i} type="button" className={i === active ? 'active' : ''} onClick={() => setActive(i)} />
          ))}
        </div>
      )}
      <div className="carousel-inner">
        {items.map((child, i) =>
          React.isValidElement(child)
            ? React.cloneElement(child, { key: i, 'data-active': i === active })
            : child
        )}
      </div>
      {showControls && count > 1 && <>
        <button className="carousel-control-prev" type="button" onClick={() => setActive((active - 1 + count) % count)}>
          <span className="carousel-control-prev-icon" aria-hidden="true" />
        </button>
        <button className="carousel-control-next" type="button" onClick={() => setActive((active + 1) % count)}>
          <span className="carousel-control-next-icon" aria-hidden="true" />
        </button>
      </>}
    </Tag>
  );
};

export const MDBCarouselInner = ({ tag: Tag = 'div', className, children, ...rest }) => (
  <Tag className={clsx('carousel-inner', className)} {...rest}>{children}</Tag>
);

export const MDBCarouselItem = ({ tag: Tag = 'div', className, children, itemId, ...rest }) => {
  const isActive = rest['data-active'];
  return <Tag className={clsx('carousel-item', isActive && 'active', className)} {...rest}>{children}</Tag>;
};

export const MDBCarouselElement = ({ tag: Tag = 'img', className, ...rest }) => (
  <Tag className={clsx('d-block w-100', className)} {...rest} />
);

export const MDBCarouselCaption = ({ tag: Tag = 'div', className, children, ...rest }) => (
  <Tag className={clsx('carousel-caption d-none d-md-block', className)} {...rest}>{children}</Tag>
);

// ─── Scrollspy ────────────────────────────────────────────────────────────────

export const MDBScrollspy = ({ tag: Tag = 'div', className, children, ...rest }) => (
  <Tag className={className} {...rest}>{children}</Tag>
);

export const MDBScrollspySection = ({ tag: Tag = 'section', className, children, ...rest }) => (
  <Tag className={className} {...rest}>{children}</Tag>
);

export const MDBScrollspyNavItem = ({ tag: Tag = 'li', className, children, ...rest }) => (
  <Tag className={clsx('nav-item', className)} {...rest}>{children}</Tag>
);

export const MDBScrollspyNavLink = ({ tag: Tag = 'a', className, children, active, collapsible, ...rest }) => (
  <Tag className={clsx('nav-link', active && 'active', className)} {...rest}>{children}</Tag>
);

export const MDBScrollspyNavList = ({ tag: Tag = 'ul', className, children, ...rest }) => (
  <Tag className={clsx('nav flex-column', className)} {...rest}>{children}</Tag>
);

// ─── Tabs ─────────────────────────────────────────────────────────────────────

export const MDBTabs = ({ tag: Tag = 'ul', fill, justify, pills, className, children, ...rest }) => (
  <Tag className={clsx('nav', pills ? 'nav-pills' : 'nav-tabs', fill && 'nav-fill', justify && 'nav-justified', className)} role="tablist" {...rest}>{children}</Tag>
);

export const MDBTabsItem = ({ tag: Tag = 'li', className, children, ...rest }) => (
  <Tag className={clsx('nav-item', className)} role="presentation" {...rest}>{children}</Tag>
);

export const MDBTabsLink = ({ tag: Tag = 'a', active, className, children, ...rest }) => (
  <Tag className={clsx('nav-link', active && 'active', className)} role="tab" {...rest}>{children}</Tag>
);

export const MDBTabsContent = ({ tag: Tag = 'div', className, children, ...rest }) => (
  <Tag className={clsx('tab-content', className)} {...rest}>{children}</Tag>
);

export const MDBTabsPane = ({ tag: Tag = 'div', show, className, children, ...rest }) => (
  <Tag className={clsx('tab-pane', 'fade', show && 'show active', className)} role="tabpanel" {...rest}>{children}</Tag>
);

// ─── Tooltip ──────────────────────────────────────────────────────────────────

export const MDBTooltip = ({
  tag: Tag = MDBBtn,
  tooltipTag = 'div',
  placement = 'top',
  title,
  wrapperProps = {},
  wrapperClass,
  className,
  children,
  domElement,
  options,
  onMouseEnter,
  onMouseLeave,
  ...rest
}) => {
  const [show, setShow] = useState(false);
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);

  // Position the tooltip using simple offset calculation
  useEffect(() => {
    if (!show || !triggerRef.current || !tooltipRef.current) return;

    const trigger = triggerRef.current;
    const tip = tooltipRef.current;
    const rect = trigger.getBoundingClientRect();

    let top = 0, left = 0;
    switch (placement) {
      case 'bottom':
        top = rect.bottom + 8;
        left = rect.left + rect.width / 2;
        break;
      case 'left':
        top = rect.top + rect.height / 2;
        left = rect.left - 8;
        break;
      case 'right':
        top = rect.top + rect.height / 2;
        left = rect.right + 8;
        break;
      default: // top
        top = rect.top - 8;
        left = rect.left + rect.width / 2;
    }

    tip.style.position = 'fixed';
    tip.style.zIndex = '9999';

    // Wait for render to get dimensions
    requestAnimationFrame(() => {
      if (!tip) return;
      const tipRect = tip.getBoundingClientRect();
      if (placement === 'top' || placement === 'bottom') {
        tip.style.left = `${left - tipRect.width / 2}px`;
        tip.style.top = placement === 'top' ? `${top - tipRect.height}px` : `${top}px`;
      } else {
        tip.style.top = `${top - tipRect.height / 2}px`;
        tip.style.left = placement === 'left' ? `${left - tipRect.width}px` : `${left}px`;
      }
    });
  }, [show, placement]);

  const handleEnter = useCallback((e) => {
    setShow(true);
    onMouseEnter && onMouseEnter(e);
  }, [onMouseEnter]);

  const handleLeave = useCallback((e) => {
    setShow(false);
    onMouseLeave && onMouseLeave(e);
  }, [onMouseLeave]);

  // Determine wrapper tag — default is MDBBtn
  const WrapperTag = typeof Tag === 'string' ? Tag : 'button';
  const wrapperBtnProps = typeof Tag !== 'string' ? {
    type: 'button',
    className: clsx(
      'btn',
      wrapperProps.color !== false && `btn-${wrapperProps.color || 'primary'}`,
      wrapperProps.shadow === false && 'shadow-none',
      wrapperClass,
    ),
  } : { className: wrapperClass };

  // If Tag is MDBBtn (default), merge button-relevant props
  const triggerProps = typeof Tag !== 'string'
    ? { ...wrapperBtnProps, ...rest }
    : { className: clsx(wrapperClass, className), ...wrapperProps, ...rest };

  return (
    <>
      <WrapperTag
        ref={triggerRef}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        {...triggerProps}
      >
        {children}
      </WrapperTag>
      {show && title && createPortal(
        <tooltipTag
          ref={tooltipRef}
          className={clsx('tooltip bs-tooltip-' + placement, 'show', className)}
          role="tooltip"
        >
          <div className="tooltip-arrow" />
          <div className="tooltip-inner">{title}</div>
        </tooltipTag>,
        document.body
      )}
    </>
  );
};

// ─── Popover ──────────────────────────────────────────────────────────────────

export const MDBPopover = ({
  tag: Tag = MDBBtn,
  popperTag = 'div',
  placement = 'bottom',
  dismiss,
  btnChildren,
  btnClassName,
  poperStyle,
  options,
  className,
  children,
  color,
  size,
  outline,
  ...rest
}) => {
  const [show, setShow] = useState(false);
  const triggerRef = useRef(null);
  const popoverRef = useRef(null);

  // Close on outside click if dismiss
  useEffect(() => {
    if (!show || !dismiss) return;
    const handler = (e) => {
      if (triggerRef.current && !triggerRef.current.contains(e.target) &&
          popoverRef.current && !popoverRef.current.contains(e.target)) {
        setShow(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [show, dismiss]);

  // Simple positioning
  useEffect(() => {
    if (!show || !triggerRef.current || !popoverRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const pop = popoverRef.current;
    pop.style.position = 'fixed';
    pop.style.zIndex = '9999';

    requestAnimationFrame(() => {
      if (!pop) return;
      const popRect = pop.getBoundingClientRect();
      let top = 0, left = 0;
      switch (placement) {
        case 'right':
          top = rect.top + rect.height / 2 - popRect.height / 2;
          left = rect.right + 8;
          break;
        case 'left':
          top = rect.top + rect.height / 2 - popRect.height / 2;
          left = rect.left - popRect.width - 8;
          break;
        case 'top':
          top = rect.top - popRect.height - 8;
          left = rect.left + rect.width / 2 - popRect.width / 2;
          break;
        default: // bottom
          top = rect.bottom + 8;
          left = rect.left + rect.width / 2 - popRect.width / 2;
      }
      pop.style.top = `${top}px`;
      pop.style.left = `${left}px`;
    });
  }, [show, placement]);

  const { onClick: externalOnClick, ...triggerRest } = rest;

  const handleTriggerClick = (event) => {
    setShow((prev) => !prev);
    if (typeof externalOnClick === 'function') externalOnClick(event);
  };

  // Build trigger button
  const btnProps = {
    ref: triggerRef,
    onClick: handleTriggerClick,
    className: clsx(
      'btn',
      outline ? `btn-outline-${color || 'primary'}` : color ? `btn-${color}` : 'btn-primary',
      size && `btn-${size}`,
      btnClassName,
    ),
    type: 'button',
  };

  return (
    <>
      <button {...btnProps} {...triggerRest}>{btnChildren}</button>
      {show && createPortal(
        <div
          ref={popoverRef}
          className={clsx('popover', `bs-popover-${placement}`, 'show', className)}
          style={poperStyle}
        >
          <div className="popover-arrow" />
          {children}
        </div>,
        document.body,
      )}
    </>
  );
};

export const MDBPopoverBody = ({ tag: Tag = 'div', className, children, ...rest }) => (
  <Tag className={clsx('popover-body', className)} {...rest}>{children}</Tag>
);

export const MDBPopoverHeader = ({ tag: Tag = 'h3', className, children, ...rest }) => (
  <Tag className={clsx('popover-header', className)} {...rest}>{children}</Tag>
);

// ─── Dropdown ─────────────────────────────────────────────────────────────────

const DropdownContext = React.createContext({ show: false, toggle: () => {} });

export const MDBDropdown = ({ tag: Tag = 'div', animation = true, group, dropup, dropend, dropstart, className, children, options, ...rest }) => {
  const [show, setShow] = useState(false);
  const ref = useRef(null);
  const toggle = useCallback(() => setShow(s => !s), []);

  // Close on outside click
  useEffect(() => {
    if (!show) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setShow(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [show]);

  return (
    <DropdownContext value={{ show, toggle }}>
      <Tag
        ref={ref}
        className={clsx(
          group ? 'btn-group' : 'dropdown',
          dropup && 'dropup',
          dropend && 'dropend',
          dropstart && 'dropstart',
          show && 'show',
          className,
        )}
        {...rest}
      >
        {children}
      </Tag>
    </DropdownContext>
  );
};

export const MDBDropdownToggle = ({ tag: Tag, split, color = 'primary', size, outline, className, children, ...rest }) => {
  const { toggle } = React.useContext(DropdownContext);
  return (
    <button
      type="button"
      className={clsx(
        'btn',
        outline ? `btn-outline-${color}` : `btn-${color}`,
        size && `btn-${size}`,
        'dropdown-toggle',
        split && 'dropdown-toggle-split',
        className,
      )}
      onClick={toggle}
      {...rest}
    >
      {children}
    </button>
  );
};

export const MDBDropdownMenu = ({ tag: Tag = 'ul', responsive, dark, className, children, ...rest }) => {
  const { show } = React.useContext(DropdownContext);
  return (
    <Tag className={clsx('dropdown-menu', show && 'show', dark && 'dropdown-menu-dark', responsive && `dropdown-menu-${responsive}`, className)} {...rest}>
      {children}
    </Tag>
  );
};

export const MDBDropdownItem = ({ tag: Tag = 'li', className, children, ...rest }) => (
  <Tag className={className} {...rest}>{children}</Tag>
);

export const MDBDropdownLink = ({ tag: Tag = 'a', active, disabled, className, children, ...rest }) => (
  <Tag className={clsx('dropdown-item', active && 'active', disabled && 'disabled', className)} {...rest}>{children}</Tag>
);

export const MDBDropdownDivider = ({ tag: Tag = 'div', className, ...rest }) => (
  <Tag className={clsx(className)}><hr className="dropdown-divider" /></Tag>
);

export const MDBDropdownHeader = ({ tag: Tag = 'h6', className, children, ...rest }) => (
  <Tag className={clsx('dropdown-header', className)} {...rest}>{children}</Tag>
);

// ─── Collapse ─────────────────────────────────────────────────────────────────

export const MDBCollapse = ({ tag: Tag = 'div', show, navbar, className, children, center, id, ...rest }) => (
  <Tag
    className={clsx('collapse', navbar && 'navbar-collapse', show && 'show', className)}
    id={id}
    {...rest}
  >
    {children}
  </Tag>
);

// ─── Modal ────────────────────────────────────────────────────────────────────

export const MDBModal = ({
  tag: Tag = 'div',
  show,
  setShow,
  staticBackdrop,
  backdrop = true,
  closeOnEsc = true,
  leaveHiddenModal = true,
  tabIndex,
  className,
  children,
  appendToBody,
  ...rest
}) => {
  // Close on ESC
  useEffect(() => {
    if (!show || !closeOnEsc) return;
    const handler = (e) => { if (e.key === 'Escape' && setShow) setShow(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [show, closeOnEsc, setShow]);

  // Close on backdrop click
  const handleBackdropClick = (e) => {
    if (staticBackdrop || !backdrop || !setShow) return;
    if (e.target === e.currentTarget) setShow(false);
  };

  if (!show && !leaveHiddenModal) return null;

  const modal = (
    <>
      <Tag
        className={clsx('modal', 'fade', show && 'show', className)}
        style={{ display: show ? 'block' : 'none' }}
        tabIndex={tabIndex || -1}
        onClick={handleBackdropClick}
        aria-modal={show ? 'true' : undefined}
        role={show ? 'dialog' : undefined}
        {...rest}
      >
        {children}
      </Tag>
      {show && backdrop && <div className="modal-backdrop fade show" />}
    </>
  );

  return appendToBody ? createPortal(modal, document.body) : modal;
};

export const MDBModalDialog = ({ tag: Tag = 'div', centered, scrollable, size, fullscreen, className, children, ...rest }) => (
  <Tag className={clsx(
    'modal-dialog',
    centered && 'modal-dialog-centered',
    scrollable && 'modal-dialog-scrollable',
    size && `modal-${size}`,
    fullscreen && (fullscreen === true ? 'modal-fullscreen' : `modal-fullscreen-${fullscreen}-down`),
    className,
  )} {...rest}>{children}</Tag>
);

export const MDBModalContent = ({ tag: Tag = 'div', className, children, ...rest }) => (
  <Tag className={clsx('modal-content', className)} {...rest}>{children}</Tag>
);

export const MDBModalHeader = ({ tag: Tag = 'div', className, children, ...rest }) => (
  <Tag className={clsx('modal-header', className)} {...rest}>{children}</Tag>
);

export const MDBModalTitle = ({ tag: Tag = 'h5', className, children, ...rest }) => (
  <Tag className={clsx('modal-title', className)} {...rest}>{children}</Tag>
);

export const MDBModalBody = ({ tag: Tag = 'div', className, children, ...rest }) => (
  <Tag className={clsx('modal-body', className)} {...rest}>{children}</Tag>
);

export const MDBModalFooter = ({ tag: Tag = 'div', className, children, ...rest }) => (
  <Tag className={clsx('modal-footer', className)} {...rest}>{children}</Tag>
);
