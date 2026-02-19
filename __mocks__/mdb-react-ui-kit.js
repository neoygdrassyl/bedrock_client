/**
 * Mock for mdb-react-ui-kit — React 19 compatibility
 *
 * mdb-react-ui-kit 1.0.0-beta3 uses `defaultProps` on forwardRef components
 * for the `tag` prop. React 19's JSX runtime no longer applies `defaultProps`
 * for function/forwardRef components, causing "Element type is invalid: undefined"
 * errors when `tag` is not explicitly provided.
 *
 * This mock provides simple HTML-element stubs for all MDB components used
 * in the project. Tests verify page logic, not MDB rendering.
 *
 * TODO: Remove this mock when mdb-react-ui-kit is replaced (Fase 7).
 */
import React from 'react';

// Helper: creates a simple stub component that renders a given HTML tag
const stub = (tag, displayName) => {
  const Comp = ({ children, className, ...rest }) =>
    React.createElement(tag, { className, 'data-testid': `mdb-${displayName}` }, children);
  Comp.displayName = displayName;
  return Comp;
};

// Layout
export const MDBContainer = stub('div', 'MDBContainer');
export const MDBRow = stub('div', 'MDBRow');
export const MDBCol = stub('div', 'MDBCol');

// Card
export const MDBCard = stub('div', 'MDBCard');
export const MDBCardBody = stub('div', 'MDBCardBody');
export const MDBCardTitle = stub('h5', 'MDBCardTitle');
export const MDBCardText = stub('p', 'MDBCardText');
export const MDBCardHeader = stub('div', 'MDBCardHeader');
export const MDBCardFooter = stub('div', 'MDBCardFooter');
export const MDBCardGroup = stub('div', 'MDBCardGroup');
export const MDBCardImage = stub('img', 'MDBCardImage');
export const MDBCardOverlay = stub('div', 'MDBCardOverlay');
export const MDBCardLink = stub('a', 'MDBCardLink');
export const MDBCardSubTitle = stub('p', 'MDBCardSubTitle');

// Button
export const MDBBtn = ({ children, className, onClick, disabled, type, tag, href, target, ...rest }) => {
  const Tag = tag || 'button';
  const props = { className, onClick, disabled, 'data-testid': 'mdb-MDBBtn' };
  if (Tag === 'button') props.type = type || 'button';
  if (href) props.href = href;
  if (target) props.target = target;
  return React.createElement(Tag, props, children);
};
MDBBtn.displayName = 'MDBBtn';

export const MDBBtnGroup = stub('div', 'MDBBtnGroup');

// Breadcrumb
export const MDBBreadcrumb = stub('ol', 'MDBBreadcrumb');
export const MDBBreadcrumbItem = stub('li', 'MDBBreadcrumbItem');

// Tabs
export const MDBTabs = stub('ul', 'MDBTabs');
export const MDBTabsItem = ({ children, className, onClick, ...rest }) =>
  React.createElement('li', { className, onClick, 'data-testid': 'mdb-MDBTabsItem' }, children);
MDBTabsItem.displayName = 'MDBTabsItem';

export const MDBTabsLink = ({ children, className, active, onClick, ...rest }) =>
  React.createElement('a', { className, onClick, 'data-testid': 'mdb-MDBTabsLink', 'data-active': active ? 'true' : 'false' }, children);
MDBTabsLink.displayName = 'MDBTabsLink';

export const MDBTabsContent = stub('div', 'MDBTabsContent');
export const MDBTabsPane = ({ children, show, className, ...rest }) =>
  show ? React.createElement('div', { className, 'data-testid': 'mdb-MDBTabsPane' }, children) : null;
MDBTabsPane.displayName = 'MDBTabsPane';

// Tooltip
export const MDBTooltip = ({ children, title, className, ...rest }) =>
  React.createElement('span', { className, title, 'data-testid': 'mdb-MDBTooltip' }, children);
MDBTooltip.displayName = 'MDBTooltip';

// Badge
export const MDBBadge = stub('span', 'MDBBadge');

// Input
export const MDBInput = ({ label, id, className, ...rest }) =>
  React.createElement('div', { 'data-testid': 'mdb-MDBInput' },
    label ? React.createElement('label', { htmlFor: id }, label) : null,
    React.createElement('input', { id, className, ...rest })
  );
MDBInput.displayName = 'MDBInput';

export const MDBInputGroup = stub('div', 'MDBInputGroup');
export const MDBInputGroupElement = stub('input', 'MDBInputGroupElement');

// Typography
export const MDBTypography = stub('p', 'MDBTypography');

// Icon
export const MDBIcon = ({ icon, className, ...rest }) =>
  React.createElement('i', { className: `fa fa-${icon} ${className || ''}`, 'data-testid': 'mdb-MDBIcon' });
MDBIcon.displayName = 'MDBIcon';

// Dropdown
export const MDBDropdown = stub('div', 'MDBDropdown');
export const MDBDropdownToggle = stub('button', 'MDBDropdownToggle');
export const MDBDropdownMenu = stub('ul', 'MDBDropdownMenu');
export const MDBDropdownItem = stub('li', 'MDBDropdownItem');
export const MDBDropdownLink = stub('a', 'MDBDropdownLink');
export const MDBDropdownHeader = stub('h6', 'MDBDropdownHeader');

// Modal
export const MDBModal = ({ children, show, ...rest }) =>
  show ? React.createElement('div', { 'data-testid': 'mdb-MDBModal' }, children) : null;
MDBModal.displayName = 'MDBModal';
export const MDBModalDialog = stub('div', 'MDBModalDialog');
export const MDBModalContent = stub('div', 'MDBModalContent');
export const MDBModalHeader = stub('div', 'MDBModalHeader');
export const MDBModalTitle = stub('h5', 'MDBModalTitle');
export const MDBModalBody = stub('div', 'MDBModalBody');
export const MDBModalFooter = stub('div', 'MDBModalFooter');

// Navbar
export const MDBNavbar = stub('nav', 'MDBNavbar');
export const MDBNavbarBrand = stub('a', 'MDBNavbarBrand');
export const MDBNavbarItem = stub('li', 'MDBNavbarItem');
export const MDBNavbarLink = stub('a', 'MDBNavbarLink');
export const MDBNavbarNav = stub('ul', 'MDBNavbarNav');
export const MDBNavbarToggler = stub('button', 'MDBNavbarToggler');

// Collapse
export const MDBCollapse = ({ children, show, ...rest }) =>
  React.createElement('div', { 'data-testid': 'mdb-MDBCollapse', style: { display: show ? 'block' : 'none' } }, children);
MDBCollapse.displayName = 'MDBCollapse';

// Table
export const MDBTable = stub('table', 'MDBTable');
export const MDBTableHead = stub('thead', 'MDBTableHead');
export const MDBTableBody = stub('tbody', 'MDBTableBody');

// Pagination
export const MDBPagination = stub('ul', 'MDBPagination');
export const MDBPaginationItem = stub('li', 'MDBPaginationItem');
export const MDBPaginationLink = stub('a', 'MDBPaginationLink');

// Popover
export const MDBPopover = stub('div', 'MDBPopover');
export const MDBPopoverBody = stub('div', 'MDBPopoverBody');
export const MDBPopoverHeader = stub('h3', 'MDBPopoverHeader');

// Progress
export const MDBProgress = stub('div', 'MDBProgress');
export const MDBProgressBar = stub('div', 'MDBProgressBar');

// Spinner
export const MDBSpinner = stub('div', 'MDBSpinner');

// Footer
export const MDBFooter = stub('footer', 'MDBFooter');

// Ripple
export const MDBRipple = stub('div', 'MDBRipple');

// Checkbox / Radio / Switch
export const MDBCheckbox = stub('input', 'MDBCheckbox');
export const MDBRadio = stub('input', 'MDBRadio');
export const MDBSwitch = stub('input', 'MDBSwitch');

// Range / File / Validation
export const MDBRange = stub('input', 'MDBRange');
export const MDBFile = stub('input', 'MDBFile');
export const MDBValidation = stub('form', 'MDBValidation');

// Accordion
export const MDBAccordion = stub('div', 'MDBAccordion');
export const MDBAccordionItem = stub('div', 'MDBAccordionItem');

// Carousel
export const MDBCarousel = stub('div', 'MDBCarousel');
export const MDBCarouselInner = stub('div', 'MDBCarouselInner');
export const MDBCarouselItem = stub('div', 'MDBCarouselItem');
export const MDBCarouselElement = stub('img', 'MDBCarouselElement');
export const MDBCarouselCaption = stub('div', 'MDBCarouselCaption');

// List Group
export const MDBListGroup = stub('ul', 'MDBListGroup');
export const MDBListGroupItem = stub('li', 'MDBListGroupItem');

// Scrollspy
export const MDBScrollspy = stub('div', 'MDBScrollspy');
export const MDBScrollspyNavItem = stub('li', 'MDBScrollspyNavItem');
export const MDBScrollspyNavLink = stub('a', 'MDBScrollspyNavLink');
export const MDBScrollspyNavList = stub('ul', 'MDBScrollspyNavList');
export const MDBScrollspySection = stub('section', 'MDBScrollspySection');

// InputGroup text
export const MDBInputGroupText = stub('span', 'MDBInputGroupText');
